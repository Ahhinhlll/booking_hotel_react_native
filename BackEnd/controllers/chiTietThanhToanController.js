const ChiTietThanhToan = require("../models/chiTietThanhToanModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await ChiTietThanhToan.findAll({
      include: [{ model: db.ThanhToan, as: "ThanhToan" }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await ChiTietThanhToan.findByPk(req.params.id, {
      include: [{ model: db.ThanhToan, as: "ThanhToan" }],
    });
    if (item) res.status(200).json(item);
    else
      res.status(404).json({ message: "Không tìm thấy chi tiết thanh toán" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const db = require("../models");
    const { maTT } = req.body;
    if (!maTT) {
      return res.status(400).json({ message: "Thiếu mã thanh toán (maTT)" });
    }
    // Kiểm tra ThanhToan tồn tại
    const thanhToan = await db.ThanhToan.findByPk(maTT);
    if (!thanhToan) {
      return res.status(400).json({ message: "Thanh toán không tồn tại" });
    }
    const newItem = await ChiTietThanhToan.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await ChiTietThanhToan.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else
      res.status(404).json({ message: "Không tìm thấy chi tiết thanh toán" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await ChiTietThanhToan.destroy({
      where: { maCTTT: req.params.id },
    });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else
      res.status(404).json({ message: "Không tìm thấy chi tiết thanh toán" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await ChiTietThanhToan.findAll({
      where: {
        loaiKhoan: { [Op.like]: `%${q}%` },
      },
      include: [{ model: db.ThanhToan, as: "ThanhToan" }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
