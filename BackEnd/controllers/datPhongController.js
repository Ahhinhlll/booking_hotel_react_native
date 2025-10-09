const DatPhong = require("../models/datPhongModel");
const Phong = require("../models/phongModel");
const GiaPhong = require("../models/giaPhongModel");
const KhuyenMai = require("../models/khuyenMaiModel");
const ThanhToan = require("../models/thanhToanModel");
const KhachSan = require("../models/khachSanModel");
const { Op } = require("sequelize");
const db = require("../models");
const sequelize = require("../config/config");

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
    const item = await DatPhong.findByPk(req.params.id, {
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
    const transaction = await db.DatPhong.sequelize.transaction();
    const {
      maND,
      maPhong,
      maGiaPhong,
      maKM,
      loaiDat,
      ngayNhan,
      ngayTra,
      soNguoiLon,
      soTreEm,
      soGio,
      soNgay,
      ghiChu,
      maKS,
      phuongThucThanhToan, // Thêm phương thức thanh toán
    } = req.body;

    console.log("Received booking data:", {
      maND,
      maPhong,
      maGiaPhong,
      loaiDat,
      ngayNhan,
      ngayTra,
      soNguoiLon,
      soTreEm,
      soGio,
      soNgay,
      ghiChu,
      maKS,
      phuongThucThanhToan,
    });

    // Kiểm tra thông tin bắt buộc với debug chi tiết
    if (!maND) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Thiếu maND (mã người dùng)",
        received: { maND },
      });
    }
    if (!maPhong) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Thiếu maPhong (mã phòng)",
        received: { maPhong },
      });
    }
    if (!maGiaPhong) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Thiếu maGiaPhong (mã giá phòng)",
        received: { maGiaPhong },
      });
    }
    if (!loaiDat) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Thiếu loaiDat (loại đặt)",
        received: { loaiDat },
      });
    }

    // Kiểm tra người dùng
    const nguoiDung = await db.NguoiDung.findByPk(maND, { transaction });
    if (!nguoiDung) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    // Kiểm tra phòng
    const phong = await db.Phong.findByPk(maPhong, { transaction });
    if (!phong) {
      return res.status(400).json({
        success: false,
        message: "Phòng không tồn tại",
      });
    }

    // Kiểm tra giá phòng
    const giaPhong = await db.GiaPhong.findByPk(maGiaPhong, { transaction });
    if (!giaPhong) {
      return res.status(400).json({
        success: false,
        message: "Giá phòng không tồn tại",
      });
    }

    // Kiểm tra khuyến mãi nếu có
    let khuyenMai = null;
    if (maKM) {
      khuyenMai = await db.KhuyenMai.findByPk(maKM, { transaction });
      if (!khuyenMai) {
        return res.status(400).json({
          success: false,
          message: "Khuyến mãi không tồn tại",
        });
      }
    }

    // Kiểm tra xem phòng có đang được đặt trong khoảng thời gian này không
    const existingBooking = await DatPhong.findOne({
      where: {
        maPhong,
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
      transaction,
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Phòng đã được đặt trong khoảng thời gian này",
      });
    }

    // Tính tổng tiền
    let tongTienGoc = 0;
    let tongTienSauGiam = 0;

    if (loaiDat === "Theo giờ") {
      if (soGio) {
        if (soGio <= 2) {
          tongTienGoc = giaPhong.gia2GioDau;
        } else {
          tongTienGoc =
            giaPhong.gia2GioDau + (soGio - 2) * giaPhong.gia1GioThem;
        }
      }
    } else if (loaiDat === "Qua đêm") {
      tongTienGoc = giaPhong.giaQuaDem;
    } else if (loaiDat === "Theo ngày") {
      if (soNgay) {
        tongTienGoc = giaPhong.giaTheoNgay * soNgay;
      }
    }

    // Áp dụng khuyến mãi nếu có
    if (khuyenMai) {
      if (khuyenMai.phanTramGiam > 0) {
        tongTienSauGiam =
          tongTienGoc - (tongTienGoc * khuyenMai.phanTramGiam) / 100;
      } else if (khuyenMai.giaTriGiam > 0) {
        tongTienSauGiam = tongTienGoc - khuyenMai.giaTriGiam;
      } else {
        tongTienSauGiam = tongTienGoc;
      }
      tongTienSauGiam = Math.max(tongTienSauGiam, 0); // Không cho phép giá âm
    } else {
      tongTienSauGiam = tongTienGoc;
    }

    // Xác định trạng thái ban đầu dựa trên phương thức thanh toán
    let trangThaiDatPhong = "Chưa thanh toán";
    if (phuongThucThanhToan) {
      // Nếu có phương thức thanh toán được cung cấp, có thể xử lý thanh toán ngay
      trangThaiDatPhong = "Chờ xác nhận thanh toán";
    }

    // Tạo đơn đặt phòng
    console.log("Creating DatPhong with maND:", maND);
    const newBooking = await DatPhong.create(
      {
        maND,
        maPhong,
        maGiaPhong,
        maKM,
        loaiDat,
        ngayNhan,
        ngayTra,
        soNguoiLon: soNguoiLon || 1,
        soTreEm: soTreEm || 0,
        soGio,
        soNgay,
        tongTienGoc,
        tongTienSauGiam,
        trangThai: trangThaiDatPhong, // Trạng thái dựa trên phương thức thanh toán
        ghiChu,
        maKS: maKS || phong.maKS, // Lấy mã khách sạn từ phòng nếu không có
      },
      { transaction }
    );

    // Nếu có phương thức thanh toán, tạo bản ghi thanh toán
    if (phuongThucThanhToan) {
      await db.ThanhToan.create(
        {
          maDatPhong: newBooking.maDatPhong,
          phuongThuc: phuongThucThanhToan,
          soTien: tongTienSauGiam,
          trangThai: "Chưa thanh toán", // Trạng thái thanh toán ban đầu
        },
        { transaction }
      );
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      data: newBooking,
      message: "Đặt phòng thành công",
    });
  } catch (error) {
    console.error("Lỗi khi đặt phòng:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Cập nhật đơn đặt phòng
exports.update = async (req, res) => {
  try {
    const booking = await DatPhong.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đặt phòng",
      });
    }

    // Kiểm tra nếu cập nhật ngày nhận/trả thì kiểm tra trùng lặp
    const { ngayNhan, ngayTra, maPhong, trangThai } = req.body;
    if (ngayNhan && ngayTra) {
      const existingBooking = await DatPhong.findOne({
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

    const booking = await DatPhong.findByPk(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đặt phòng",
      });
    }

    await booking.update({ trangThai });

    res.status(200).json({
      success: true,
      data: booking,
      message: "Cập nhật trạng thái đặt phòng thành công",
    });
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
    const room = await Phong.findByPk(roomId, {
      include: [{ model: db.GiaPhong }],
    });

    if (!room) {
      return res.status(400).json({
        success: false,
        message: "Phòng không tồn tại",
      });
    }

    // 3. Kiểm tra khách sạn có tồn tại không
    const hotel = await KhachSan.findByPk(hotelId);
    if (!hotel) {
      return res.status(400).json({
        success: false,
        message: "Khách sạn không tồn tại",
      });
    }

    // 4. Kiểm tra tính khả dụng của phòng (CRITICAL)
    const checkInDate = new Date(checkInDateTime);
    const checkOutDate = new Date(checkOutDateTime);

    // Validate dates
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "Ngày nhận phòng phải trước ngày trả phòng",
      });
    }

    const existingBooking = await DatPhong.findOne({
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
        serverCalculatedBasePrice = giaPhong.giaTheoNgay;
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
      const promotion = await KhuyenMai.findByPk(promotionId);

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
          }
          finalPrice = Math.max(finalPrice, 0); // Không cho phép giá âm
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
    const insertData = {
      maND: "temp_user_id", // Trong thực tế sẽ lấy từ JWT token
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
      ghiChu: `Thông tin người đặt: ${bookerInfo.name} - ${bookerInfo.phoneNumber}`,
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

    const payment = await ThanhToan.create(paymentData);

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
      await DatPhong.update(
        { trangThai: "Đã xác nhận" },
        { where: { maDatPhong: bookingData.maDatPhong } }
      );
      await payment.update({ trangThai: "Đã thanh toán" });
    } else {
      await DatPhong.update(
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
        promotion: null, // Có thể thêm logic promotion sau
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

    const room = await Phong.findByPk(roomId, {
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
      const promotion = await KhuyenMai.findByPk(promotionId);

      if (promotion) {
        const now = new Date();
        const startDate = new Date(promotion.ngayBatDau);
        const endDate = new Date(promotion.ngayKetThuc);

        if (now >= startDate && now <= endDate) {
          if (promotion.phanTramGiam > 0) {
            finalPrice = basePrice - (basePrice * promotion.phanTramGiam) / 100;
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

    const existingBooking = await DatPhong.findOne({
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
