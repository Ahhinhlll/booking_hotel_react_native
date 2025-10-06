const DatPhong = require("../models/datPhongModel");
const Phong = require("../models/phongModel");
const GiaPhong = require("../models/giaPhongModel");
const KhuyenMai = require("../models/khuyenMaiModel");
const ThanhToan = require("../models/thanhToanModel");
const { Op } = require("sequelize");
const db = require("../models");

// API endpoint để xác nhận đặt phòng và xử lý thanh toán
exports.confirmBooking = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const {
      roomId,
      hotelId,
      checkInDateTime,
      checkOutDateTime,
      bookingType,
      duration,
      paymentMethod,
      clientCalculatedTotalAmount,
      promotionId,
      bookerInfo = {
        phoneNumber: "+84 387238815",
        name: "Joyer.651"
      }
    } = req.body;

    // 1. Validation đầu vào
    if (!roomId || !hotelId || !checkInDateTime || !checkOutDateTime || !bookingType || !paymentMethod) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc"
      });
    }

    // 2. Kiểm tra phòng có tồn tại không
    const room = await Phong.findByPk(roomId, { 
      include: [{ model: db.GiaPhong }],
      transaction 
    });
    
    if (!room) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Phòng không tồn tại"
      });
    }

    // 3. Kiểm tra tính khả dụng của phòng (CRITICAL)
    const checkInDate = new Date(checkInDateTime);
    const checkOutDate = new Date(checkOutDateTime);
    
    const existingBooking = await DatPhong.findOne({
      where: {
        maPhong: roomId,
        trangThai: {
          [Op.notIn]: ["Đã hủy", "Đã hoàn thành"]
        },
        [Op.or]: [
          {
            ngayNhan: { [Op.lt]: checkOutDate },
            ngayTra: { [Op.gt]: checkInDate }
          },
          {
            ngayNhan: { [Op.between]: [checkInDate, checkOutDate] }
          },
          {
            ngayTra: { [Op.between]: [checkInDate, checkOutDate] }
          }
        ]
      },
      transaction
    });

    if (existingBooking) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Phòng đã được đặt trong khoảng thời gian này"
      });
    }

    // 4. Tính toán giá phòng trên server (SECURITY)
    const giaPhong = room.GiaPhongs?.[0];
    if (!giaPhong) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin giá phòng"
      });
    }

    let serverCalculatedBasePrice = 0;
    
    switch (bookingType) {
      case 'hourly':
        if (duration <= 2) {
          serverCalculatedBasePrice = giaPhong.gia2GioDau;
        } else {
          serverCalculatedBasePrice = giaPhong.gia2GioDau + (duration - 2) * giaPhong.gia1GioThem;
        }
        break;
      case 'overnight':
        serverCalculatedBasePrice = giaPhong.giaQuaDem;
        break;
      case 'daily':
        serverCalculatedBasePrice = giaPhong.giaTheoNgay;
        break;
      default:
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Loại đặt phòng không hợp lệ"
        });
    }

    // 5. Xử lý khuyến mãi nếu có
    let finalPrice = serverCalculatedBasePrice;
    let appliedPromotion = null;
    
    if (promotionId) {
      const promotion = await KhuyenMai.findByPk(promotionId, { transaction });
      
      if (promotion) {
        // Kiểm tra khuyến mãi có còn hiệu lực không
        const now = new Date();
        const startDate = new Date(promotion.ngayBatDau);
        const endDate = new Date(promotion.ngayKetThuc);
        
        if (now >= startDate && now <= endDate) {
          if (promotion.phanTramGiam > 0) {
            finalPrice = serverCalculatedBasePrice - (serverCalculatedBasePrice * promotion.phanTramGiam / 100);
          } else if (promotion.giaTriGiam > 0) {
            finalPrice = serverCalculatedBasePrice - promotion.giaTriGiam;
          }
          finalPrice = Math.max(finalPrice, 0); // Không cho phép giá âm
          appliedPromotion = promotion;
        }
      }
    }

    // 6. So sánh giá với client (SECURITY CHECK)
    const priceDifference = Math.abs(finalPrice - clientCalculatedTotalAmount);
    const tolerance = 1000; // Cho phép sai lệch 1000đ
    
    if (priceDifference > tolerance) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Giá không khớp. Giá server: ${finalPrice.toLocaleString('vi-VN')}₫, Giá client: ${clientCalculatedTotalAmount.toLocaleString('vi-VN')}₫`
      });
    }

    // 7. Tạo booking record
    const bookingData = {
      maND: "temp_user_id", // Trong thực tế sẽ lấy từ JWT token
      maPhong: roomId,
      maGiaPhong: giaPhong.maGiaPhong,
      maKM: promotionId || null,
      loaiDat: bookingType === 'hourly' ? 'Theo giờ' : 
               bookingType === 'overnight' ? 'Qua đêm' : 'Theo ngày',
      ngayNhan: checkInDate,
      ngayTra: checkOutDate,
      soNguoiLon: 1,
      soTreEm: 0,
      soGio: bookingType === 'hourly' ? duration : null,
      soNgay: bookingType === 'daily' ? 1 : null,
      tongTienGoc: serverCalculatedBasePrice,
      tongTienSauGiam: finalPrice,
      trangThai: "Chờ thanh toán",
      ghiChu: `Thông tin người đặt: ${bookerInfo.name} - ${bookerInfo.phoneNumber}`,
      maKS: hotelId
    };

    const newBooking = await DatPhong.create(bookingData, { transaction });

    // 8. Tạo payment record
    const paymentData = {
      maDatPhong: newBooking.maDatPhong,
      phuongThuc: paymentMethod,
      soTien: finalPrice,
      trangThai: "Chưa thanh toán",
      maGiaoDich: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    const payment = await ThanhToan.create(paymentData, { transaction });

    // 9. Xử lý thanh toán dựa trên phương thức
    let paymentResult = { success: false, message: "Chưa xử lý thanh toán" };
    
    switch (paymentMethod) {
      case 'momo':
        paymentResult = await processMoMoPayment(finalPrice, newBooking.maDatPhong);
        break;
      case 'zalopay':
        paymentResult = await processZaloPayPayment(finalPrice, newBooking.maDatPhong);
        break;
      case 'shopeepay':
        paymentResult = await processShopeePayPayment(finalPrice, newBooking.maDatPhong);
        break;
      case 'credit':
        paymentResult = await processCreditCardPayment(finalPrice, newBooking.maDatPhong);
        break;
      case 'atm':
        paymentResult = await processATMPayment(finalPrice, newBooking.maDatPhong);
        break;
      case 'hotel':
        paymentResult = { success: true, message: "Thanh toán tại khách sạn" };
        break;
      default:
        paymentResult = { success: false, message: "Phương thức thanh toán không hỗ trợ" };
    }

    // 10. Cập nhật trạng thái dựa trên kết quả thanh toán
    if (paymentResult.success) {
      await newBooking.update({ trangThai: "Đã xác nhận" }, { transaction });
      await payment.update({ trangThai: "Đã thanh toán" }, { transaction });
    } else {
      await newBooking.update({ trangThai: "Thanh toán thất bại" }, { transaction });
      await payment.update({ trangThai: "Thanh toán thất bại" }, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      data: {
        bookingId: newBooking.maDatPhong,
        finalAmount: finalPrice,
        basePrice: serverCalculatedBasePrice,
        discountAmount: serverCalculatedBasePrice - finalPrice,
        paymentStatus: paymentResult.success ? "success" : "failed",
        paymentMessage: paymentResult.message,
        promotion: appliedPromotion ? {
          name: appliedPromotion.tenKM,
          discount: appliedPromotion.phanTramGiam || appliedPromotion.giaTriGiam
        } : null
      },
      message: paymentResult.success ? "Đặt phòng và thanh toán thành công" : "Đặt phòng thành công, thanh toán thất bại"
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi khi xác nhận đặt phòng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xử lý đặt phòng",
      error: error.message
    });
  }
};

// Hàm xử lý thanh toán MoMo (Mock)
async function processMoMoPayment(amount, bookingId) {
  // Trong thực tế sẽ tích hợp với MoMo API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Thanh toán MoMo thành công" });
    }, 1000);
  });
}

// Hàm xử lý thanh toán ZaloPay (Mock)
async function processZaloPayPayment(amount, bookingId) {
  // Trong thực tế sẽ tích hợp với ZaloPay API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Thanh toán ZaloPay thành công" });
    }, 1000);
  });
}

// Hàm xử lý thanh toán ShopeePay (Mock)
async function processShopeePayPayment(amount, bookingId) {
  // Trong thực tế sẽ tích hợp với ShopeePay API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Thanh toán ShopeePay thành công" });
    }, 1000);
  });
}

// Hàm xử lý thanh toán Credit Card (Mock)
async function processCreditCardPayment(amount, bookingId) {
  // Trong thực tế sẽ tích hợp với Stripe hoặc VNPay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Thanh toán thẻ tín dụng thành công" });
    }, 1000);
  });
}

// Hàm xử lý thanh toán ATM (Mock)
async function processATMPayment(amount, bookingId) {
  // Trong thực tế sẽ tích hợp với ngân hàng
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Thanh toán ATM thành công" });
    }, 1000);
  });
}

// API để tính giá trước khi đặt phòng
exports.calculatePrice = async (req, res) => {
  try {
    const { roomId, bookingType, duration, promotionId } = req.body;

    if (!roomId || !bookingType) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc"
      });
    }

    const room = await Phong.findByPk(roomId, {
      include: [{ model: db.GiaPhong }]
    });

    if (!room) {
      return res.status(400).json({
        success: false,
        message: "Phòng không tồn tại"
      });
    }

    const giaPhong = room.GiaPhongs?.[0];
    if (!giaPhong) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin giá phòng"
      });
    }

    let basePrice = 0;
    
    switch (bookingType) {
      case 'hourly':
        if (duration <= 2) {
          basePrice = giaPhong.gia2GioDau;
        } else {
          basePrice = giaPhong.gia2GioDau + (duration - 2) * giaPhong.gia1GioThem;
        }
        break;
      case 'overnight':
        basePrice = giaPhong.giaQuaDem;
        break;
      case 'daily':
        basePrice = giaPhong.giaTheoNgay;
        break;
    }

    let finalPrice = basePrice;
    let appliedPromotion = null;

    if (promotionId) {
      const promotion = await KhuyenMai.findByPk(promotionId);
      
      if (promotion) {
        const now = new Date();
        const startDate = new Date(promotion.ngayBatDau);
        const endDate = new Date(promotion.ngayKetThuc);
        
        if (now >= startDate && now <= endDate) {
          if (promotion.phanTramGiam > 0) {
            finalPrice = basePrice - (basePrice * promotion.phanTramGiam / 100);
          } else if (promotion.giaTriGiam > 0) {
            finalPrice = basePrice - promotion.giaTriGiam;
          }
          finalPrice = Math.max(finalPrice, 0);
          appliedPromotion = promotion;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        basePrice,
        finalPrice,
        discountAmount: basePrice - finalPrice,
        promotion: appliedPromotion ? {
          name: appliedPromotion.tenKM,
          discount: appliedPromotion.phanTramGiam || appliedPromotion.giaTriGiam
        } : null
      }
    });

  } catch (error) {
    console.error("Lỗi khi tính giá:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tính giá",
      error: error.message
    });
  }
};

// API để kiểm tra tính khả dụng của phòng
exports.checkAvailability = async (req, res) => {
  try {
    const { roomId, checkInDateTime, checkOutDateTime } = req.query;

    if (!roomId || !checkInDateTime || !checkOutDateTime) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc"
      });
    }

    const checkInDate = new Date(checkInDateTime);
    const checkOutDate = new Date(checkOutDateTime);

    const existingBooking = await DatPhong.findOne({
      where: {
        maPhong: roomId,
        trangThai: {
          [Op.notIn]: ["Đã hủy", "Đã hoàn thành"]
        },
        [Op.or]: [
          {
            ngayNhan: { [Op.lt]: checkOutDate },
            ngayTra: { [Op.gt]: checkInDate }
          },
          {
            ngayNhan: { [Op.between]: [checkInDate, checkOutDate] }
          },
          {
            ngayTra: { [Op.between]: [checkInDate, checkOutDate] }
          }
        ]
      }
    });

    res.status(200).json({
      success: true,
      data: {
        available: !existingBooking,
        message: existingBooking ? "Phòng đã được đặt trong khoảng thời gian này" : "Phòng có sẵn"
      }
    });

  } catch (error) {
    console.error("Lỗi khi kiểm tra tính khả dụng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi kiểm tra tính khả dụng",
      error: error.message
    });
  }
};
