const DanhGia = require("../models/danhGiaModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await DanhGia.findAll({
      include: [
        { model: db.NguoiDung, as: "NguoiDung" },
        { model: db.KhachSan, as: "KhachSan" },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await DanhGia.findByPk(req.params.id, {
      include: [
        { model: db.NguoiDung, as: "NguoiDung" },
        { model: db.KhachSan, as: "KhachSan" },
      ],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy đánh giá" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { maND, maKS } = req.body;
    if (!maND || !maKS) {
      return res
        .status(400)
        .json({ message: "Thiếu mã người dùng hoặc mã khách sạn" });
    }
    // Kiểm tra NguoiDung tồn tại
    const nguoiDung = await db.NguoiDung.findByPk(maND);
    if (!nguoiDung) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }
    // Kiểm tra KhachSan tồn tại
    const khachSan = await db.KhachSan.findByPk(maKS);
    if (!khachSan) {
      return res.status(400).json({ message: "Khách sạn không tồn tại" });
    }
    const newItem = await DanhGia.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await DanhGia.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy đánh giá" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await DanhGia.destroy({ where: { maDG: req.params.id } });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy đánh giá" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await DanhGia.findAll({
      where: {
        binhLuan: { [Op.like]: `%${q}%` },
      },
      include: [
        { model: db.NguoiDung, as: "NguoiDung" },
        { model: db.KhachSan, as: "KhachSan" },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
