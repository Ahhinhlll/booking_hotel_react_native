const DatPhong = require("../models/datPhongModel");
const Phong = require("../models/phongModel");
const GiaPhong = require("../models/giaPhongModel");
const KhuyenMai = require("../models/khuyenMaiModel");
const ThanhToan = require("../models/thanhToanModel");
const KhachSan = require("../models/khachSanModel");
const { Op } = require("sequelize");
const db = require("../models");
const sequelize = require("../config/config");
const nguoiDungController = require("./nguoiDungController");
const fs = require("fs");
const path = require("path");

// Helper function để lấy thông tin user từ JWT token
const getUserFromToken = async (req, transaction = null) => {
  try {
    // Kiểm tra xem có thông tin user từ JWT token không
    if (req.user && req.user.maNguoiDung) {
      const userId = req.user.maNguoiDung;

      // Sử dụng nguoiDungController.getById để lấy thông tin user
      return new Promise((resolve, reject) => {
        const mockReq = { params: { id: userId } };
        const mockRes = {
          status: (code) => ({
            json: (data) => {
              if (code === 200) {
                resolve(data); // Trả về thông tin user
              } else {
                reject(new Error(data.message || "Không tìm thấy người dùng"));
              }
            },
          }),
        };

        nguoiDungController.getById(mockReq, mockRes);
      });
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Lấy tất cả đơn đặt phòng
exports.getAll = async (req, res) => {
  try {
    const items = await DatPhong.findAll({
      include: [
        { model: db.NguoiDung, attributes: ["hoTen", "sdt", "email"] },
        {
          model: db.KhachSan,
          attributes: ["tenKS", "diaChi", "tinhThanh", "hangSao", "anh"],
        },
        {
          model: db.Phong,
          attributes: ["tenPhong", "anh", "dienTich", "trangThai"],
          include: [
            {
              model: db.GiaPhong,
              attributes: [
                "giaQuaDem",
                "giaTheoNgay",
                "gia2GioDau",
                "gia1GioThem",
                "loaiDat",
              ],
            },
          ],
        },
        {
          model: db.KhuyenMai,
          attributes: [
            "tenKM",
            "thongTinKM",
            "anh",
            "giaTriGiam",
            "phanTramGiam",
          ],
        }, // giảm theo % thì giá trị giảm = 0 và ngược lại
        {
          model: db.ThanhToan,
          attributes: ["phuongThuc", "soTien", "trangThai", "ngayTT"],
        },
        {
          model: db.SuCo,
          attributes: ["moTa", "chiPhi", "trangThai", "ngayBao"],
        }, // nếu có thì mới tính chi phi, ko thì mặc định 0đ
      ],
      order: [["ngayDat", "DESC"]],
    });
    res.status(200).json({
      success: true,
      data: items,
      message: "Lấy danh sách đặt phòng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Lấy đơn đặt phòng theo ID
exports.getById = async (req, res) => {
  try {
    const item = await db.DatPhong.findByPk(req.params.id, {
      include: [
        {
          model: db.NguoiDung,
          attributes: ["hoTen", "sdt", "email", "diaChi"],
        },
        {
          model: db.KhachSan,
          attributes: ["tenKS", "diaChi", "tinhThanh", "hangSao", "anh"],
        },
        {
          model: db.Phong,
          attributes: ["tenPhong", "anh", "dienTich", "trangThai"],
          include: [
            {
              model: db.GiaPhong,
              attributes: [
                "giaQuaDem",
                "giaTheoNgay",
                "gia2GioDau",
                "gia1GioThem",
                "loaiDat",
              ],
            },
          ],
        },
        {
          model: db.KhuyenMai,
          attributes: [
            "tenKM",
            "thongTinKM",
            "anh",
            "giaTriGiam",
            "phanTramGiam",
            "ngayBatDau",
            "ngayKetThuc",
          ],
        },
        {
          model: db.ThanhToan,
          attributes: [
            "phuongThuc",
            "soTien",
            "trangThai",
            "ngayTT",
            "maGiaoDich",
          ],
        },
        {
          model: db.SuCo,
          attributes: ["moTa", "chiPhi", "trangThai", "ngayBao"],
        },
        {
          model: db.DanhGia,
          attributes: ["soSao", "binhLuan", "ngayDG"],
        },
      ],
    });
    if (item) {
      res.status(200).json({
        success: true,
        data: item,
        message: "Lấy thông tin đặt phòng thành công",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy đặt phòng",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Tạo mới đơn đặt phòng
exports.insert = async (req, res) => {
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
        name: "Joyer.651",
      },
    } = req.body;

    // 1. Validation đầu vào
    if (
      !roomId ||
      !hotelId ||
      !checkInDateTime ||
      !checkOutDateTime ||
      !bookingType ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu thông tin bắt buộc: roomId, hotelId, checkInDateTime, checkOutDateTime, bookingType, paymentMethod",
      });
    }

    // 2. Kiểm tra phòng có tồn tại không
    const room = await db.Phong.findByPk(roomId, {
      include: [{ model: db.GiaPhong }],
    });

    if (!room) {
      return res.status(400).json({
        success: false,
        message: "Phòng không tồn tại",
      });
    }

    // 3. Kiểm tra khách sạn có tồn tại không
    const hotel = await db.KhachSan.findByPk(hotelId);
    if (!hotel) {
      return res.status(400).json({
        success: false,
        message: "Khách sạn không tồn tại",
      });
    }

    // 4. Kiểm tra tính khả dụng của phòng (CRITICAL)
    const checkInDate = new Date(checkInDateTime);
    const checkOutDate = new Date(checkOutDateTime);

    if (checkInDate >= checkOutDate) {
      console.log("❌ Date validation failed:", {
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        checkInDateTime: checkInDateTime,
        checkOutDateTime: checkOutDateTime,
      });
      return res.status(400).json({
        success: false,
        message: "Ngày nhận phòng phải trước ngày trả phòng",
        debug: {
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          checkInDateTime: checkInDateTime,
          checkOutDateTime: checkOutDateTime,
          bookingType: bookingType,
          duration: duration,
        },
      });
    }

    const existingBooking = await db.DatPhong.findOne({
      where: {
        maPhong: roomId,
        trangThai: {
          [Op.notIn]: ["Đã hủy", "Đã hoàn thành"],
        },
        [Op.or]: [
          {
            ngayNhan: { [Op.lt]: checkOutDate },
            ngayTra: { [Op.gt]: checkInDate },
          },
          {
            ngayNhan: { [Op.between]: [checkInDate, checkOutDate] },
          },
          {
            ngayTra: { [Op.between]: [checkInDate, checkOutDate] },
          },
        ],
      },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Phòng đã được đặt trong khoảng thời gian này",
      });
    }

    // 5. Tính toán giá phòng trên server (SECURITY)
    const giaPhong = room.GiaPhongs?.[0];
    if (!giaPhong) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin giá phòng",
      });
    }

    let serverCalculatedBasePrice = 0;

    switch (bookingType) {
      case "hourly":
        if (duration <= 2) {
          serverCalculatedBasePrice = giaPhong.gia2GioDau;
        } else {
          serverCalculatedBasePrice =
            giaPhong.gia2GioDau + (duration - 2) * giaPhong.gia1GioThem;
        }
        break;
      case "overnight":
        serverCalculatedBasePrice = giaPhong.giaQuaDem;
        break;
      case "daily":
        serverCalculatedBasePrice = giaPhong.giaTheoNgay * duration;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Loại đặt phòng không hợp lệ",
        });
    }

    // 6. Xử lý khuyến mãi nếu có
    let finalPrice = serverCalculatedBasePrice;
    let appliedPromotion = null;

    if (promotionId) {
      const promotion = await db.KhuyenMai.findByPk(promotionId);

      if (promotion) {
        // Kiểm tra khuyến mãi có còn hiệu lực không
        const now = new Date();
        const startDate = new Date(promotion.ngayBatDau);
        const endDate = new Date(promotion.ngayKetThuc);

        if (now >= startDate && now <= endDate) {
          let discountAmount = 0;

          if (promotion.phanTramGiam > 0) {
            discountAmount = Math.round(
              (serverCalculatedBasePrice * promotion.phanTramGiam) / 100
            );
            finalPrice = serverCalculatedBasePrice - discountAmount;
          } else if (promotion.giaTriGiam > 0) {
            discountAmount = promotion.giaTriGiam;
            finalPrice = serverCalculatedBasePrice - discountAmount;
          } else if (promotion.thongTinKM) {
            const discountMatch = promotion.thongTinKM.match(/giảm\s*(\d+)k/i);
            if (discountMatch) {
              discountAmount = parseInt(discountMatch[1]) * 1000; // Convert to VND
              finalPrice = serverCalculatedBasePrice - discountAmount;
            }
          }

          finalPrice = Math.max(Math.round(finalPrice), 0); // Làm tròn và không cho phép giá âm
          appliedPromotion = promotion;
        }
      }
    }

    // 7. So sánh giá base price với client (SECURITY CHECK)
    const priceDifference = Math.abs(
      serverCalculatedBasePrice - clientCalculatedTotalAmount
    );
    const tolerance = 1000; // Cho phép sai lệch 1K cho giá base price

    if (priceDifference > tolerance) {
      return res.status(400).json({
        success: false,
        message: `Giá base không khớp. Giá server: ${serverCalculatedBasePrice.toLocaleString(
          "vi-VN"
        )}₫, Giá client: ${clientCalculatedTotalAmount.toLocaleString(
          "vi-VN"
        )}₫, Chênh lệch: ${priceDifference.toLocaleString("vi-VN")}₫`,
      });
    }

    // 8. Tạo đơn đặt phòng
    const transaction = await db.DatPhong.sequelize.transaction();

    try {
      // Lấy thông tin user từ JWT token hoặc sử dụng thông tin từ bookerInfo
      let userId = null;
      let userInfo = null;
      let userName = "Khách hàng";
      let userPhone = "0123456789";

      try {
        // Thử lấy thông tin user từ JWT token
        userInfo = await getUserFromToken(req, transaction);

        if (userInfo) {
          // Có thông tin user từ JWT token
          userId = userInfo.maNguoiDung;
          userName = userInfo.hoTen;
          userPhone = userInfo.sdt;

          // Kiểm tra trạng thái tài khoản
          if (userInfo.trangThai !== "Hoạt động") {
            return res.status(403).json({
              success: false,
              message: "Tài khoản đã bị khóa hoặc không hoạt động",
            });
          }
        } else {
          // Không có JWT token, yêu cầu đăng nhập
          return res.status(401).json({
            success: false,
            message: "Vui lòng đăng nhập để thực hiện đặt phòng",
          });
        }
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin người dùng",
          error: error.message,
        });
      }
      const newBooking = await db.DatPhong.create(
        {
          maND: userId,
          maPhong: roomId,
          maGiaPhong: giaPhong.maGiaPhong,
          maKM: promotionId || null,
          loaiDat:
            bookingType === "hourly"
              ? "Theo giờ"
              : bookingType === "overnight"
              ? "Qua đêm"
              : "Theo ngày",
          ngayNhan: checkInDate,
          ngayTra: checkOutDate,
          soNguoiLon: 1,
          soTreEm: 0,
          soGio: bookingType === "hourly" ? duration : null,
          soNgay: bookingType === "daily" ? 1 : null,
          tongTienGoc: serverCalculatedBasePrice,
          tongTienSauGiam: finalPrice,
          trangThai: "Chờ thanh toán",
          ghiChu: `Thông tin người đặt: ${userName} - ${userPhone}`,
          maKS: hotelId,
        },
        { transaction }
      );

      // 9. Xử lý thanh toán
      const paymentData = {
        maDatPhong: newBooking.maDatPhong,
        phuongThuc: paymentMethod,
        soTien: finalPrice,
        trangThai: "Chưa thanh toán",
        maGiaoDich: `TXN_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };

      const payment = await db.ThanhToan.create(paymentData, { transaction });

      // Xử lý thanh toán dựa trên phương thức
      let paymentResult = { success: false, message: "Chưa xử lý thanh toán" };

      switch (paymentMethod) {
        case "momo":
          paymentResult = await processMoMoPayment(
            finalPrice,
            newBooking.maDatPhong
          );
          break;
        case "zalopay":
          paymentResult = await processZaloPayPayment(
            finalPrice,
            newBooking.maDatPhong
          );
          break;
        case "shopeepay":
          paymentResult = await processShopeePayPayment(
            finalPrice,
            newBooking.maDatPhong
          );
          break;
        case "credit":
          paymentResult = await processCreditCardPayment(
            finalPrice,
            newBooking.maDatPhong
          );
          break;
        case "atm":
          paymentResult = await processATMPayment(
            finalPrice,
            newBooking.maDatPhong
          );
          break;
        case "hotel":
          paymentResult = {
            success: true,
            message: "Thanh toán tại khách sạn",
          };
          break;
        default:
          paymentResult = {
            success: false,
            message: "Phương thức thanh toán không hỗ trợ",
          };
      }

      // Cập nhật trạng thái dựa trên kết quả thanh toán
      if (paymentResult.success) {
        // Nếu thanh toán online thành công -> "Đã xác nhận"
        if (paymentMethod !== "hotel") {
          await db.DatPhong.update(
            { trangThai: "Đã xác nhận" },
            { where: { maDatPhong: newBooking.maDatPhong }, transaction }
          );
        }
        // Nếu thanh toán tại khách sạn -> vẫn giữ "Chờ thanh toán"

        await db.ThanhToan.update(
          { trangThai: "Đã thanh toán" },
          { where: { maDatPhong: newBooking.maDatPhong }, transaction }
        );
      }

      await transaction.commit();

      res.status(201).json({
        success: true,
        data: {
          bookingId: newBooking.maDatPhong,
          finalAmount: finalPrice,
          paymentResult,
          appliedPromotion,
        },
        message: "Đặt phòng thành công",
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Lỗi khi đặt phòng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xử lý đặt phòng",
      error: error.message,
    });
  }
};

// Cập nhật đơn đặt phòng
exports.update = async (req, res) => {
  try {
    const booking = await db.DatPhong.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đặt phòng",
      });
    }

    // Kiểm tra nếu cập nhật ngày nhận/trả thì kiểm tra trùng lặp
    const { ngayNhan, ngayTra, maPhong, trangThai } = req.body;
    if (ngayNhan && ngayTra) {
      const existingBooking = await db.DatPhong.findOne({
        where: {
          maPhong: maPhong || booking.maPhong,
          maDatPhong: { [Op.ne]: req.params.id }, // Không kiểm tra chính bản ghi đang cập nhật
          trangThai: {
            [Op.notIn]: ["Đã hủy", "Đã hoàn thành"],
          },
          [Op.or]: [
            {
              ngayNhan: { [Op.lt]: ngayTra },
              ngayTra: { [Op.gt]: ngayNhan },
            },
            {
              ngayNhan: { [Op.between]: [ngayNhan, ngayTra] },
            },
            {
              ngayTra: { [Op.between]: [ngayNhan, ngayTra] },
            },
          ],
        },
      });

      if (existingBooking) {
        return res.status(400).json({
          success: false,
          message: "Phòng đã được đặt trong khoảng thời gian này",
        });
      }
    }

    // Cập nhật thông tin đặt phòng
    await booking.update(req.body);

    res.status(200).json({
      success: true,
      data: booking,
      message: "Cập nhật đặt phòng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Xóa đơn đặt phòng
exports.remove = async (req, res) => {
  try {
    const deleted = await DatPhong.destroy({
      where: { maDatPhong: req.params.id },
    });
    if (deleted) {
      res.status(200).json({
        success: true,
        message: "Xóa đặt phòng thành công",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy đặt phòng",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Tìm kiếm đơn đặt phòng
exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await DatPhong.findAll({
      where: {
        [Op.or]: [
          { maDatPhong: { [Op.like]: `%${q}%` } },
          { "$NguoiDung.hoTen$": { [Op.like]: `%${q}%` } },
          { "$Phong.tenPhong$": { [Op.like]: `%${q}%` } },
          { "$KhachSan.tenKS$": { [Op.like]: `%${q}%` } },
        ],
      },
      include: [
        { model: db.NguoiDung, attributes: ["hoTen", "sdt", "email"] },
        { model: db.KhachSan, attributes: ["tenKS", "diaChi", "tinhThanh"] },
        { model: db.Phong, attributes: ["tenPhong", "anh"] },
        {
          model: db.KhuyenMai,
          attributes: ["tenKM", "giaTriGiam", "phanTramGiam"],
        },
        {
          model: db.ThanhToan,
          attributes: ["phuongThuc", "soTien", "trangThai"],
        },
        { model: db.SuCo, attributes: ["moTa", "chiPhi", "trangThai"] },
        { model: db.DanhGia, attributes: ["soSao", "binhLuan", "ngayDG"] },
      ],
      order: [["ngayDat", "DESC"]],
    });
    res.status(200).json({
      success: true,
      data: items,
      message: "Tìm kiếm đặt phòng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Lấy đơn đặt phòng theo người dùng
exports.getByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await DatPhong.findAll({
      where: { maND: userId },
      include: [
        { model: db.NguoiDung, attributes: ["hoTen", "sdt", "email"] },
        {
          model: db.KhachSan,
          attributes: ["tenKS", "diaChi", "tinhThanh", "hangSao", "anh"],
        },
        {
          model: db.Phong,
          attributes: ["tenPhong", "anh"],
          include: [
            {
              model: db.GiaPhong,
              attributes: [
                "giaQuaDem",
                "giaTheoNgay",
                "gia2GioDau",
                "gia1GioThem",
              ],
            },
          ],
        },
        {
          model: db.KhuyenMai,
          attributes: ["tenKM", "giaTriGiam", "phanTramGiam"],
        },
        {
          model: db.ThanhToan,
          attributes: ["phuongThuc", "soTien", "trangThai"],
        },
      ],
      order: [["ngayDat", "DESC"]],
    });
    res.status(200).json({
      success: true,
      data: items,
      message: "Lấy danh sách đặt phòng của người dùng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Cập nhật trạng thái đặt phòng
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai } = req.body;

    const booking = await db.DatPhong.findByPk(id, {
      include: [
        { model: db.NguoiDung, attributes: ["hoTen", "sdt", "email"] },
        { model: db.KhachSan, attributes: ["tenKS", "diaChi", "tinhThanh"] },
        { model: db.Phong, attributes: ["tenPhong", "anh", "dienTich"] },
        {
          model: db.ThanhToan,
          attributes: ["phuongThuc", "soTien", "trangThai"],
        },
      ],
    });

    if (!booking) {
      console.log("❌ Booking not found:", id);
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đặt phòng",
      });
    }

    // Nếu trạng thái là "Hoàn thành", tạo bản sao lưu và xóa đơn hàng
    if (trangThai === "Hoàn thành") {
      let transaction;
      try {
        transaction = await sequelize.transaction();
      } catch (transactionError) {
        console.error("Error creating transaction:", transactionError);
        throw transactionError;
      }

      try {
        // Tạo bản sao lưu để lưu vào completedBookings.json
        const completedBooking = {
          maDP: booking.maDatPhong,
          maND: booking.maND,
          maPhong: booking.maPhong,
          maKS: booking.maKS,
          loaiDat: booking.loaiDat,
          ngayDat: booking.ngayDat,
          ngayNhan: booking.ngayNhan,
          ngayTra: booking.ngayTra,
          soNguoiLon: booking.soNguoiLon,
          soTreEm: booking.soTreEm,
          soGio: booking.soGio,
          soNgay: booking.soNgay,
          tongTienGoc: booking.tongTienGoc,
          tongTienSauGiam: booking.tongTienSauGiam,
          maKM: booking.maKM,
          trangThai: "Hoàn thành",
          ghiChu: booking.ghiChu,
          maGiaPhong: booking.maGiaPhong,
          tenNguoiDat: booking.NguoiDung?.hoTen,
          sdtNguoiDat: booking.NguoiDung?.sdt,
          emailNguoiDat: booking.NguoiDung?.email,
          tenKS: booking.KhachSan?.tenKS,
          diaChiKS: booking.KhachSan?.diaChi,
          tinhThanhKS: booking.KhachSan?.tinhThanh,
          tenPhong: booking.Phong?.tenPhong,
          anhPhong: booking.Phong?.anh || [],
          dienTichPhong: booking.Phong?.dienTich,
          hasReviewed: false,
          completedAt: new Date().toISOString(),
          originalId: booking.maDatPhong,
          status: "completed",
        };

        console.log(
          "✅ Completed booking object created:",
          completedBooking.maDP
        );

        // Lưu vào file completedBookings.json
        console.log("💾 Preparing to save to JSON file...");
        const fs = require("fs");
        const path = require("path");
        const dataDir = path.join(__dirname, "../data");
        const completedBookingsPath = path.join(
          dataDir,
          "completedBookings.json"
        );

        console.log("📁 Data directory:", dataDir);
        console.log("📄 JSON file path:", completedBookingsPath);

        // Tạo thư mục data nếu chưa tồn tại
        if (!fs.existsSync(dataDir)) {
          console.log("📁 Creating data directory...");
          fs.mkdirSync(dataDir, { recursive: true });
        }

        let completedBookingsData = {
          completedBookings: [],
          lastUpdated: new Date().toISOString(),
        };

        // Đọc file hiện tại nếu tồn tại
        if (fs.existsSync(completedBookingsPath)) {
          console.log("📖 Reading existing JSON file...");
          try {
            const existingData = fs.readFileSync(completedBookingsPath, "utf8");
            completedBookingsData = JSON.parse(existingData);
            console.log("✅ Successfully read existing file");
          } catch (error) {
            console.log(
              "❌ Error reading completedBookings.json, creating new file:",
              error.message
            );
          }
        } else {
          console.log("📄 JSON file does not exist, will create new one");
        }

        // Thêm booking mới vào đầu mảng
        completedBookingsData.completedBookings.unshift(completedBooking);
        completedBookingsData.lastUpdated = new Date().toISOString();

        // Ghi file
        try {
          fs.writeFileSync(
            completedBookingsPath,
            JSON.stringify(completedBookingsData, null, 2)
          );
          console.log(
            "✅ Completed booking saved to JSON file:",
            completedBooking.maDP
          );
        } catch (writeError) {
          console.error(
            "❌ Error writing to completedBookings.json:",
            writeError
          );
          throw new Error(`Không thể lưu vào file JSON: ${writeError.message}`);
        }

        // Xóa đơn hàng khỏi bảng đặt phòng
        await booking.destroy({ transaction });
        await transaction.commit();

        res.status(200).json({
          success: true,
          data: completedBooking,
          message: "Đặt phòng đã hoàn thành và được lưu vào lịch sử",
        });
      } catch (error) {
        await transaction.rollback();
        console.error("❌ Transaction rolled back due to error:", error);
        throw error;
      }
    } else {
      // Cập nhật trạng thái bình thường
      await booking.update({ trangThai });

      res.status(200).json({
        success: true,
        data: booking,
        message: "Cập nhật trạng thái đặt phòng thành công",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// API endpoint để xác nhận đặt phòng và xử lý thanh toán
exports.confirmBooking = async (req, res) => {
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
        name: "Joyer.651",
      },
    } = req.body;

    // 1. Validation đầu vào
    if (
      !roomId ||
      !hotelId ||
      !checkInDateTime ||
      !checkOutDateTime ||
      !bookingType ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu thông tin bắt buộc: roomId, hotelId, checkInDateTime, checkOutDateTime, bookingType, paymentMethod",
      });
    }

    // 2. Kiểm tra phòng có tồn tại không
    const room = await db.Phong.findByPk(roomId, {
      include: [{ model: db.GiaPhong }],
    });

    if (!room) {
      return res.status(400).json({
        success: false,
        message: "Phòng không tồn tại",
      });
    }

    // 3. Kiểm tra khách sạn có tồn tại không
    const hotel = await db.KhachSan.findByPk(hotelId);
    if (!hotel) {
      return res.status(400).json({
        success: false,
        message: "Khách sạn không tồn tại",
      });
    }

    // 4. Kiểm tra tính khả dụng của phòng (CRITICAL)
    const checkInDate = new Date(checkInDateTime);
    const checkOutDate = new Date(checkOutDateTime);

    if (checkInDate >= checkOutDate) {
      console.log("❌ Date validation failed:", {
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        checkInDateTime: checkInDateTime,
        checkOutDateTime: checkOutDateTime,
      });
      return res.status(400).json({
        success: false,
        message: "Ngày nhận phòng phải trước ngày trả phòng",
        debug: {
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          checkInDateTime: checkInDateTime,
          checkOutDateTime: checkOutDateTime,
          bookingType: bookingType,
          duration: duration,
        },
      });
    }

    const existingBooking = await db.DatPhong.findOne({
      where: {
        maPhong: roomId,
        trangThai: {
          [Op.notIn]: ["Đã hủy", "Đã hoàn thành"],
        },
        [Op.or]: [
          {
            ngayNhan: { [Op.lt]: checkOutDate },
            ngayTra: { [Op.gt]: checkInDate },
          },
          {
            ngayNhan: { [Op.between]: [checkInDate, checkOutDate] },
          },
          {
            ngayTra: { [Op.between]: [checkInDate, checkOutDate] },
          },
        ],
      },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Phòng đã được đặt trong khoảng thời gian này",
      });
    }

    // 5. Tính toán giá phòng trên server (SECURITY)
    const giaPhong = room.GiaPhongs?.[0];
    if (!giaPhong) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin giá phòng",
      });
    }

    let serverCalculatedBasePrice = 0;

    switch (bookingType) {
      case "hourly":
        if (duration <= 2) {
          serverCalculatedBasePrice = giaPhong.gia2GioDau;
        } else {
          serverCalculatedBasePrice =
            giaPhong.gia2GioDau + (duration - 2) * giaPhong.gia1GioThem;
        }
        break;
      case "overnight":
        serverCalculatedBasePrice = giaPhong.giaQuaDem;
        break;
      case "daily":
        serverCalculatedBasePrice = giaPhong.giaTheoNgay * duration;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Loại đặt phòng không hợp lệ",
        });
    }

    // 6. Xử lý khuyến mãi nếu có
    let finalPrice = serverCalculatedBasePrice;
    let appliedPromotion = null;

    if (promotionId) {
      const promotion = await db.KhuyenMai.findByPk(promotionId);

      if (promotion) {
        // Kiểm tra khuyến mãi có còn hiệu lực không
        const now = new Date();
        const startDate = new Date(promotion.ngayBatDau);
        const endDate = new Date(promotion.ngayKetThuc);

        if (now >= startDate && now <= endDate) {
          let discountAmount = 0;

          if (promotion.phanTramGiam > 0) {
            discountAmount = Math.round(
              (serverCalculatedBasePrice * promotion.phanTramGiam) / 100
            );
            finalPrice = serverCalculatedBasePrice - discountAmount;
            console.log("Backend percentage discount:", {
              serverCalculatedBasePrice,
              phanTramGiam: promotion.phanTramGiam,
              discountAmount,
              finalPrice,
            });
          } else if (promotion.giaTriGiam > 0) {
            discountAmount = promotion.giaTriGiam;
            finalPrice = serverCalculatedBasePrice - discountAmount;
            console.log("Backend fixed amount discount:", {
              serverCalculatedBasePrice,
              giaTriGiam: promotion.giaTriGiam,
              discountAmount,
              finalPrice,
            });
          } else if (promotion.thongTinKM) {
            // Parse từ text như "giảm 30K" -> 30000
            const discountMatch = promotion.thongTinKM.match(/giảm\s*(\d+)k/i);
            if (discountMatch) {
              discountAmount = parseInt(discountMatch[1]) * 1000; // Convert to VND
              finalPrice = serverCalculatedBasePrice - discountAmount;
              console.log("Backend text-based discount:", {
                serverCalculatedBasePrice,
                thongTinKM: promotion.thongTinKM,
                discountAmount,
                finalPrice,
              });
            }
          }

          finalPrice = Math.max(Math.round(finalPrice), 0); // Làm tròn và không cho phép giá âm
          appliedPromotion = promotion;
        }
      }
    }

    if (promotionId) {
      const promotion = await db.KhuyenMai.findByPk(promotionId);

      if (promotion) {
        // Kiểm tra khuyến mãi có còn hiệu lực không
        const now = new Date();
        const startDate = new Date(promotion.ngayBatDau);
        const endDate = new Date(promotion.ngayKetThuc);

        if (now >= startDate && now <= endDate) {
          if (promotion.phanTramGiam > 0) {
            finalPrice =
              serverCalculatedBasePrice -
              (serverCalculatedBasePrice * promotion.phanTramGiam) / 100;
          } else if (promotion.giaTriGiam > 0) {
            finalPrice = serverCalculatedBasePrice - promotion.giaTriGiam;
          } else if (promotion.thongTinKM) {
            // Parse từ text như "giảm 30K" -> 30000
            const discountMatch = promotion.thongTinKM.match(/giảm\s*(\d+)k/i);
            if (discountMatch) {
              const discountAmount = parseInt(discountMatch[1]) * 1000; // Convert to VND
              finalPrice = serverCalculatedBasePrice - discountAmount;
            }
          }
          finalPrice = Math.max(Math.round(finalPrice), 0); // Làm tròn và không cho phép giá âm
          appliedPromotion = promotion;
        }
      }
    }

    // 7. So sánh giá với client (SECURITY CHECK)
    const priceDifference = Math.abs(finalPrice - clientCalculatedTotalAmount);
    const tolerance = 1000; // Cho phép sai lệch 1000đ

    if (priceDifference > tolerance) {
      return res.status(400).json({
        success: false,
        message: `Giá không khớp. Giá server: ${finalPrice.toLocaleString(
          "vi-VN"
        )}₫, Giá client: ${clientCalculatedTotalAmount.toLocaleString(
          "vi-VN"
        )}₫`,
      });
    }

    // 8. Chuẩn bị dữ liệu cho insert function
    // Lấy thông tin user từ JWT token hoặc sử dụng thông tin từ bookerInfo
    let userId = null;
    let userInfo = null;
    let userName = "Khách hàng";
    let userPhone = "0123456789";

    try {
      // Thử lấy thông tin user từ JWT token
      userInfo = await getUserFromToken(req);

      if (userInfo) {
        // Có thông tin user từ JWT token
        userId = userInfo.maNguoiDung;
        userName = userInfo.hoTen;
        userPhone = userInfo.sdt;

        // Kiểm tra trạng thái tài khoản
        if (userInfo.trangThai !== "Hoạt động") {
          return res.status(403).json({
            success: false,
            message: "Tài khoản đã bị khóa hoặc không hoạt động",
          });
        }
      } else {
        // Không có JWT token, yêu cầu đăng nhập
        return res.status(401).json({
          success: false,
          message: "Vui lòng đăng nhập để thực hiện đặt phòng",
        });
      }
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
        error: error.message,
      });
    }

    const insertData = {
      maND: userId,
      maPhong: roomId,
      maGiaPhong: giaPhong.maGiaPhong,
      maKM: promotionId || null,
      loaiDat:
        bookingType === "hourly"
          ? "Theo giờ"
          : bookingType === "overnight"
          ? "Qua đêm"
          : "Theo ngày",
      ngayNhan: checkInDate,
      ngayTra: checkOutDate,
      soNguoiLon: 1,
      soTreEm: 0,
      soGio: bookingType === "hourly" ? duration : null,
      soNgay: bookingType === "daily" ? 1 : null,
      ghiChu: `Thông tin người đặt: ${userName} - ${userPhone}`,
      maKS: hotelId,
      phuongThucThanhToan: paymentMethod,
    };

    console.log("Creating booking with data:", insertData); // Debug log

    // 9. Sử dụng insert function có sẵn
    const insertReq = { body: insertData };
    const insertRes = {
      status: (code) => ({
        json: (data) => {
          if (code === 201) {
            // Insert thành công, tiếp tục xử lý thanh toán
            handlePaymentProcessing(data.data, paymentMethod, finalPrice, res);
          } else {
            // Insert thất bại
            res.status(code).json(data);
          }
        },
      }),
    };

    await exports.insert(insertReq, insertRes);
  } catch (error) {
    console.error("Lỗi khi xác nhận đặt phòng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xử lý đặt phòng",
      error: error.message,
    });
  }
};

// Helper function để xử lý thanh toán sau khi insert thành công
async function handlePaymentProcessing(
  bookingData,
  paymentMethod,
  finalPrice,
  res
) {
  try {
    // Tạo payment record
    const paymentData = {
      maDatPhong: bookingData.maDatPhong,
      phuongThuc: paymentMethod,
      soTien: finalPrice,
      trangThai: "Chưa thanh toán",
      maGiaoDich: `TXN_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };

    console.log("Creating payment with data:", paymentData); // Debug log

    const payment = await db.ThanhToan.create(paymentData);

    // Xử lý thanh toán dựa trên phương thức
    let paymentResult = { success: false, message: "Chưa xử lý thanh toán" };

    switch (paymentMethod) {
      case "momo":
        paymentResult = await processMoMoPayment(
          finalPrice,
          bookingData.maDatPhong
        );
        break;
      case "zalopay":
        paymentResult = await processZaloPayPayment(
          finalPrice,
          bookingData.maDatPhong
        );
        break;
      case "shopeepay":
        paymentResult = await processShopeePayPayment(
          finalPrice,
          bookingData.maDatPhong
        );
        break;
      case "credit":
        paymentResult = await processCreditCardPayment(
          finalPrice,
          bookingData.maDatPhong
        );
        break;
      case "atm":
        paymentResult = await processATMPayment(
          finalPrice,
          bookingData.maDatPhong
        );
        break;
      case "hotel":
        paymentResult = { success: true, message: "Thanh toán tại khách sạn" };
        break;
      default:
        paymentResult = {
          success: false,
          message: "Phương thức thanh toán không hỗ trợ",
        };
    }

    // Cập nhật trạng thái dựa trên kết quả thanh toán
    if (paymentResult.success) {
      // Đối với ATM, chỉ cập nhật trạng thái khi có xác nhận thanh toán
      if (paymentMethod === "atm" && paymentResult.requiresConfirmation) {
        // Giữ nguyên trạng thái "Chờ thanh toán" cho ATM
        console.log(
          `ATM payment QR generated for booking ${bookingData.maDatPhong}`
        );
        await payment.update({ trangThai: "Chờ xác nhận" });
      } else if (paymentMethod !== "hotel") {
        // Nếu thanh toán online thành công -> "Đã xác nhận"
        await db.DatPhong.update(
          { trangThai: "Đã xác nhận" },
          { where: { maDatPhong: bookingData.maDatPhong } }
        );
        await payment.update({ trangThai: "Đã thanh toán" });
      }
      // Nếu thanh toán tại khách sạn -> vẫn giữ "Chờ thanh toán"
    } else {
      await db.DatPhong.update(
        { trangThai: "Thanh toán thất bại" },
        { where: { maDatPhong: bookingData.maDatPhong } }
      );
      await payment.update({ trangThai: "Thanh toán thất bại" });
    }

    console.log("Booking created successfully:", bookingData.maDatPhong); // Debug log

    res.status(200).json({
      success: true,
      data: {
        bookingId: bookingData.maDatPhong,
        finalAmount: finalPrice,
        basePrice: bookingData.tongTienGoc,
        discountAmount: bookingData.tongTienGoc - finalPrice,
        paymentStatus: paymentResult.success ? "success" : "failed",
        paymentMessage: paymentResult.message,
        // Thêm QR data cho ATM
        qrData:
          paymentMethod === "atm" && paymentResult.qrData
            ? paymentResult.qrData
            : null,
        requiresConfirmation:
          paymentMethod === "atm" && paymentResult.requiresConfirmation,
        promotion: appliedPromotion
          ? {
              name: appliedPromotion.tenKM,
              discount:
                appliedPromotion.phanTramGiam || appliedPromotion.giaTriGiam,
            }
          : null,
      },
      message: paymentResult.success
        ? "Đặt phòng và thanh toán thành công"
        : "Đặt phòng thành công, thanh toán thất bại",
    });
  } catch (error) {
    console.error("Lỗi khi xử lý thanh toán:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xử lý thanh toán",
      error: error.message,
    });
  }
}

// API để tính giá trước khi đặt phòng
exports.calculatePrice = async (req, res) => {
  try {
    const { roomId, bookingType, duration, promotionId } = req.body;

    if (!roomId || !bookingType) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const room = await db.Phong.findByPk(roomId, {
      include: [{ model: db.GiaPhong }],
    });

    if (!room) {
      return res.status(400).json({
        success: false,
        message: "Phòng không tồn tại",
      });
    }

    const giaPhong = room.GiaPhongs?.[0];
    if (!giaPhong) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin giá phòng",
      });
    }

    let basePrice = 0;

    switch (bookingType) {
      case "hourly":
        if (duration <= 2) {
          basePrice = giaPhong.gia2GioDau;
        } else {
          basePrice =
            giaPhong.gia2GioDau + (duration - 2) * giaPhong.gia1GioThem;
        }
        break;
      case "overnight":
        basePrice = giaPhong.giaQuaDem;
        break;
      case "daily":
        basePrice = giaPhong.giaTheoNgay;
        break;
    }

    let finalPrice = basePrice;
    let appliedPromotion = null;

    if (promotionId) {
      const promotion = await db.KhuyenMai.findByPk(promotionId);

      if (promotion) {
        const now = new Date();
        const startDate = new Date(promotion.ngayBatDau);
        const endDate = new Date(promotion.ngayKetThuc);

        if (now >= startDate && now <= endDate) {
          if (promotion.phanTramGiam > 0) {
            finalPrice = basePrice - (basePrice * promotion.phanTramGiam) / 100;
          } else if (promotion.giaTriGiam > 0) {
            finalPrice = basePrice - promotion.giaTriGiam;
          } else if (promotion.thongTinKM) {
            // Parse từ text như "giảm 30K" -> 30000
            const discountMatch = promotion.thongTinKM.match(/giảm\s*(\d+)k/i);
            if (discountMatch) {
              const discountAmount = parseInt(discountMatch[1]) * 1000; // Convert to VND
              finalPrice = basePrice - discountAmount;
            }
          }
          finalPrice = Math.max(Math.round(finalPrice), 0);
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
        promotion: appliedPromotion
          ? {
              name: appliedPromotion.tenKM,
              discount:
                appliedPromotion.phanTramGiam || appliedPromotion.giaTriGiam,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tính giá:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tính giá",
      error: error.message,
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
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const checkInDate = new Date(checkInDateTime);
    const checkOutDate = new Date(checkOutDateTime);

    const existingBooking = await db.DatPhong.findOne({
      where: {
        maPhong: roomId,
        trangThai: {
          [Op.notIn]: ["Đã hủy", "Đã hoàn thành"],
        },
        [Op.or]: [
          {
            ngayNhan: { [Op.lt]: checkOutDate },
            ngayTra: { [Op.gt]: checkInDate },
          },
          {
            ngayNhan: { [Op.between]: [checkInDate, checkOutDate] },
          },
          {
            ngayTra: { [Op.between]: [checkInDate, checkOutDate] },
          },
        ],
      },
    });

    res.status(200).json({
      success: true,
      data: {
        available: !existingBooking,
        message: existingBooking
          ? "Phòng đã được đặt trong khoảng thời gian này"
          : "Phòng có sẵn",
      },
    });
  } catch (error) {
    console.error("Lỗi khi kiểm tra tính khả dụng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi kiểm tra tính khả dụng",
      error: error.message,
    });
  }
};

// API để kiểm tra trạng thái đặt phòng của một phòng cụ thể
exports.checkRoomBookingStatus = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã phòng",
      });
    }

    // Kiểm tra xem phòng có đang được đặt không (trạng thái không phải "Đã hủy" hoặc "Đã hoàn thành")
    const activeBooking = await db.DatPhong.findOne({
      where: {
        maPhong: roomId,
        trangThai: {
          [Op.notIn]: ["Đã hủy", "Đã hoàn thành"],
        },
      },
      include: [
        {
          model: db.NguoiDung,
          attributes: ["hoTen", "sdt"],
        },
      ],
      order: [["ngayDat", "DESC"]], // Lấy booking mới nhất
    });

    res.status(200).json({
      success: true,
      data: {
        isBooked: !!activeBooking,
        bookingInfo: activeBooking
          ? {
              maDatPhong: activeBooking.maDatPhong,
              trangThai: activeBooking.trangThai,
              ngayNhan: activeBooking.ngayNhan,
              ngayTra: activeBooking.ngayTra,
              loaiDat: activeBooking.loaiDat,
              nguoiDat: activeBooking.NguoiDung?.hoTen || "Không xác định",
              sdt: activeBooking.NguoiDung?.sdt || "Không xác định",
            }
          : null,
        message: activeBooking
          ? `Phòng đã được đặt bởi ${
              activeBooking.NguoiDung?.hoTen || "khách hàng"
            }`
          : "Phòng có sẵn để đặt",
      },
    });
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái đặt phòng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi kiểm tra trạng thái đặt phòng",
      error: error.message,
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

// Hàm xử lý thanh toán ATM với VietQR
async function processATMPayment(amount, bookingId) {
  try {
    // Tạo QR code data cho VietQR
    const qrData = {
      templateId: "ayXKCCn",
      accountNumber: "0387238815",
      accountName: "LUONG THANH BINH",
      bankCode: "970422",
      amount: amount,
      addInfo: `Thanh toan phong - Booking ${bookingId}`,
      qrUrl: `https://api.vietqr.io/image/970422-0387238815-ayXKCCn.jpg?accountName=LUONG%20THANH%20BINH&amount=${amount}&addInfo=Thanh%20toan%20phong%20-%20Booking%20${bookingId}`,
    };

    // Trả về thông tin QR code để frontend hiển thị
    return {
      success: true,
      message: "Tạo QR code thanh toán ATM thành công",
      qrData: qrData,
      paymentStatus: "pending", // Trạng thái chờ thanh toán
      requiresConfirmation: true, // Yêu cầu xác nhận từ frontend
    };
  } catch (error) {
    console.error("Error processing ATM payment:", error);
    return {
      success: false,
      message: "Lỗi khi tạo QR code thanh toán ATM",
      error: error.message,
    };
  }
}

// API để xác nhận thanh toán ATM
exports.confirmATMPayment = async (req, res) => {
  try {
    const { bookingId, transactionId, amount } = req.body;

    // Validation
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin booking ID",
      });
    }

    // Tìm booking
    const booking = await db.DatPhong.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn đặt phòng",
      });
    }

    // Tìm payment record
    const payment = await db.ThanhToan.findOne({
      where: { maDatPhong: bookingId },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin thanh toán",
      });
    }

    // Kiểm tra trạng thái hiện tại
    if (payment.trangThai === "Đã thanh toán") {
      return res.status(200).json({
        success: true,
        message: "Thanh toán đã được xác nhận trước đó",
        data: {
          bookingId: bookingId,
          paymentStatus: "confirmed",
          confirmedAt: payment.ngayTT,
        },
      });
    }

    // Cập nhật trạng thái booking và payment
    await db.DatPhong.update(
      { trangThai: "Đã xác nhận" },
      { where: { maDatPhong: bookingId } }
    );

    await db.ThanhToan.update(
      {
        trangThai: "Đã thanh toán",
        ngayTT: new Date(),
        maGiaoDich: transactionId || payment.maGiaoDich,
      },
      { where: { maDatPhong: bookingId } }
    );

    console.log(`ATM payment confirmed for booking ${bookingId}`);

    res.status(200).json({
      success: true,
      message: "Xác nhận thanh toán ATM thành công",
      data: {
        bookingId: bookingId,
        paymentStatus: "confirmed",
        confirmedAt: new Date(),
        amount: payment.soTien,
      },
    });
  } catch (error) {
    console.error("Error confirming ATM payment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xác nhận thanh toán ATM",
      error: error.message,
    });
  }
};

// API để lấy danh sách completed bookings từ JSON file
exports.getCompletedBookings = async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const completedBookingsPath = path.join(
      __dirname,
      "../data/completedBookings.json"
    );

    if (!fs.existsSync(completedBookingsPath)) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Chưa có đơn đặt phòng hoàn thành nào",
      });
    }

    const data = fs.readFileSync(completedBookingsPath, "utf8");
    const completedBookingsData = JSON.parse(data);

    res.status(200).json({
      success: true,
      data: completedBookingsData.completedBookings || [],
      message: "Lấy danh sách đơn đặt phòng hoàn thành thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// API để lấy completed bookings theo user ID
exports.getCompletedBookingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const fs = require("fs");
    const path = require("path");
    const completedBookingsPath = path.join(
      __dirname,
      "../data/completedBookings.json"
    );

    if (!fs.existsSync(completedBookingsPath)) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Chưa có đơn đặt phòng hoàn thành nào",
      });
    }

    const data = fs.readFileSync(completedBookingsPath, "utf8");
    const completedBookingsData = JSON.parse(data);

    // Lọc theo userId
    const userCompletedBookings = (
      completedBookingsData.completedBookings || []
    ).filter((booking) => booking.maND === userId);

    res.status(200).json({
      success: true,
      data: userCompletedBookings,
      message:
        "Lấy danh sách đơn đặt phòng hoàn thành của người dùng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
