const crypto = require("crypto");
const axios = require("axios");
const db = require("../models");
const os = require("os");

/**
 * Lấy địa chỉ IP local của máy
 */
const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const ifaceName of Object.keys(interfaces)) {
    const iface = interfaces[ifaceName];
    if (iface) {
      for (const alias of iface) {
        if (alias.family === "IPv4" && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  return "localhost";
};

// MoMo UAT Config
const MOMO_CONFIG = {
  partnerCode: "MOMO",
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  ipnUrl: process.env.MOMO_IPN_URL || "http://localhost:3333/api/momo/callback",
  // Sử dụng captureWallet để lấy deeplink mở app MoMo trực tiếp
  requestType: "captureWallet",
};

/**
 * Lấy redirect URL động theo IP hiện tại
 */
const getRedirectUrl = () => {
  if (process.env.MOMO_REDIRECT_URL) {
    return process.env.MOMO_REDIRECT_URL;
  }
  const ip = getLocalIpAddress();
  const expoPort = process.env.EXPO_PORT || "8081";
  return `exp://${ip}:${expoPort}/--/booking/momo-result`;
};

/**
 * Tạo chữ ký HMAC SHA256
 */
const createSignature = (rawSignature) => {
  return crypto
    .createHmac("sha256", MOMO_CONFIG.secretKey)
    .update(rawSignature)
    .digest("hex");
};

/**
 * Tạo link thanh toán MoMo
 * POST /api/momo/create-payment
 */
const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, orderInfo } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bookingId hoặc amount",
      });
    }

    // Kiểm tra booking tồn tại (không bắt buộc vì booking có thể đang được tạo)
    try {
      const booking = await db.DatPhong.findByPk(bookingId);
      if (booking) {
        console.log("Found booking:", booking.maDatPhong);
      } else {
        console.log("Booking not found, but continuing...");
      }
    } catch (dbError) {
      console.log("DB check error (continuing):", dbError.message);
    }

    // Tạo orderId và requestId unique
    const orderId = `BOOKING_${bookingId}_${Date.now()}`;
    const requestId = `REQ_${Date.now()}`;
    const extraData = Buffer.from(
      JSON.stringify({ bookingId: String(bookingId) })
    ).toString("base64");

    // Thông tin đơn hàng
    const orderInfoText = orderInfo || `Thanh toán đặt phòng #${bookingId}`;

    // Amount phải là số nguyên
    const amountInt = Math.round(parseInt(amount));

    // Lấy redirect URL động
    const redirectUrl = getRedirectUrl();

    // Tạo raw signature theo thứ tự của MoMo (alphabetical order)
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amountInt}&extraData=${extraData}&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfoText}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${MOMO_CONFIG.requestType}`;

    const signature = createSignature(rawSignature);

    // Body request gửi đến MoMo
    const requestBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      partnerName: "Hotel Booking App",
      storeId: "HotelBooking",
      requestId: requestId,
      amount: amountInt,
      orderId: orderId,
      orderInfo: orderInfoText,
      redirectUrl: redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      lang: "vi",
      requestType: MOMO_CONFIG.requestType,
      autoCapture: true,
      extraData: extraData,
      signature: signature,
    };

    // Gọi API MoMo
    const response = await axios.post(MOMO_CONFIG.endpoint, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.resultCode === 0) {
      // Cố gắng lưu thông tin giao dịch vào database
      try {
        await db.ThanhToan.update(
          {
            maGiaoDich: orderId,
            ghiChu: `MoMo Request ID: ${requestId}`,
          },
          {
            where: { maDatPhong: bookingId },
          }
        );
      } catch (updateError) {
        console.log(
          "Could not update ThanhToan (non-critical):",
          updateError.message
        );
      }

      return res.json({
        success: true,
        message: "Tạo link thanh toán thành công",
        data: {
          payUrl: response.data.payUrl,
          qrCodeUrl: response.data.qrCodeUrl,
          deeplink: response.data.deeplink,
          orderId: orderId,
          requestId: requestId,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: response.data.message || "Tạo link thanh toán thất bại",
        resultCode: response.data.resultCode,
        localMessage: response.data.localMessage,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Lỗi khi tạo link thanh toán: " +
        (error.response?.data?.message || error.message),
      details: error.response?.data,
    });
  }
};

/**
 * Callback từ MoMo (IPN - Instant Payment Notification)
 * POST /api/momo/callback
 */
const momoCallback = async (req, res) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    // Verify signature
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = createSignature(rawSignature);

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: "Chữ ký không hợp lệ",
      });
    }

    // Parse extraData để lấy bookingId
    let bookingId = null;
    try {
      const extraDataDecoded = JSON.parse(
        Buffer.from(extraData, "base64").toString()
      );
      bookingId = extraDataDecoded.bookingId;
    } catch (e) {
      // Fallback: lấy từ orderId
      const match = orderId.match(/BOOKING_(\d+)_/);
      if (match) {
        bookingId = parseInt(match[1]);
      }
    }

    if (!bookingId) {
      console.error("MoMo Callback: Cannot find bookingId");
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy mã đặt phòng",
      });
    }

    // Cập nhật trạng thái thanh toán
    if (resultCode === 0) {
      // Thanh toán thành công
      await db.DatPhong.update(
        { trangThai: "Đã xác nhận" },
        { where: { maDatPhong: bookingId } }
      );

      await db.ThanhToan.update(
        {
          trangThai: "Đã thanh toán",
          ngayTT: new Date(),
          maGiaoDich: transId.toString(),
        },
        { where: { maDatPhong: bookingId } }
      );
    } else {
      // Thanh toán thất bại
      console.log(
        `MoMo Payment Failed: Booking ${bookingId}, ResultCode: ${resultCode}, Message: ${message}`
      );
    }

    // MoMo yêu cầu trả về 204 No Content để xác nhận đã nhận callback
    return res.status(204).send();
  } catch (error) {
    console.error("MoMo Callback Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi xử lý callback: " + error.message,
    });
  }
};

/**
 * Redirect sau khi thanh toán - hiển thị kết quả
 * GET /api/momo/result
 */
const paymentResult = async (req, res) => {
  try {
    console.log("MoMo Result:", req.query);

    const { orderId, resultCode, message, transId } = req.query;

    // Parse bookingId từ orderId
    let bookingId = null;
    const match = orderId?.match(/BOOKING_(\d+)_/);
    if (match) {
      bookingId = parseInt(match[1]);
    }

    if (resultCode === "0") {
      // Thanh toán thành công - redirect về app
      const successUrl = `myapp://payment/success?bookingId=${bookingId}&transId=${transId}`;
      return res.redirect(successUrl);
    } else {
      // Thanh toán thất bại
      const failUrl = `myapp://payment/failed?bookingId=${bookingId}&message=${encodeURIComponent(
        message
      )}`;
      return res.redirect(failUrl);
    }
  } catch (error) {
    console.error("MoMo Result Error:", error);
    return res.status(500).send("Có lỗi xảy ra");
  }
};

/**
 * Kiểm tra trạng thái giao dịch
 * POST /api/momo/check-status
 */
const checkTransactionStatus = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu orderId",
      });
    }

    const requestId = `CHECK_${Date.now()}`;
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&orderId=${orderId}&partnerCode=${MOMO_CONFIG.partnerCode}&requestId=${requestId}`;
    const signature = createSignature(rawSignature);

    const requestBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      requestId: requestId,
      orderId: orderId,
      signature: signature,
      lang: "vi",
    };

    const response = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/query",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      success: response.data.resultCode === 0,
      data: response.data,
    });
  } catch (error) {
    console.error("MoMo Check Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra trạng thái: " + error.message,
    });
  }
};

module.exports = {
  createPayment,
  momoCallback,
  paymentResult,
  checkTransactionStatus,
};
