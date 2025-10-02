const DatPhong = require("../models/datPhongModel");
const { Op } = require("sequelize");
const db = require("../models");

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

    // Kiểm tra thông tin bắt buộc
    if (!maND || !maPhong || !maGiaPhong || !loaiDat) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu thông tin bắt buộc (maND, maPhong, maGiaPhong, loaiDat)",
      });
    }

    // Kiểm tra người dùng
    const nguoiDung = await db.NguoiDung.findByPk(maND, { transaction });
    if (!nguoiDung) {
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
