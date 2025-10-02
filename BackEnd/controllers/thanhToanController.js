const ThanhToan = require("../models/thanhToanModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await ThanhToan.findAll({
      include: [{ model: db.DatPhong }, { model: db.ChiTietThanhToan }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await ThanhToan.findByPk(req.params.id, {
      include: [{ model: db.DatPhong }, { model: db.ChiTietThanhToan }],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy thanh toán" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const transaction = await db.ThanhToan.sequelize.transaction();
    const { maDatPhong, phuongThuc, soTien, trangThai, maGiaoDich } = req.body;

    if (!maDatPhong || !phuongThuc) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã đặt phòng hoặc phương thức thanh toán",
      });
    }

    // Kiểm tra DatPhong tồn tại
    const datPhong = await db.DatPhong.findByPk(maDatPhong, { transaction });
    if (!datPhong) {
      return res.status(400).json({
        success: false,
        message: "Đặt phòng không tồn tại",
      });
    }

    // Kiểm tra xem đã có thanh toán cho đơn này chưa
    const existingPayment = await ThanhToan.findOne({
      where: { maDatPhong },
      transaction,
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Đơn đặt phòng này đã có thông tin thanh toán",
      });
    }

    // Tạo bản ghi thanh toán mới
    const newPayment = await ThanhToan.create(
      {
        maDatPhong,
        phuongThuc,
        soTien: soTien || datPhong.tongTienSauGiam, // Nếu không có số tiền, lấy từ đơn đặt phòng
        trangThai: trangThai || "Chưa thanh toán",
        maGiaoDich,
      },
      { transaction }
    );

    // Cập nhật trạng thái đơn đặt phòng
    await datPhong.update(
      {
        trangThai: "Đã thanh toán",
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      data: newPayment,
      message: "Tạo thanh toán thành công",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await ThanhToan.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy thanh toán" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await ThanhToan.destroy({ where: { maTT: req.params.id } });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy thanh toán" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await ThanhToan.findAll({
      where: {
        phuongThuc: { [Op.like]: `%${q}%` },
      },
      include: [{ model: db.DatPhong }, { model: db.ChiTietThanhToan }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
