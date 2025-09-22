const GiaPhong = require("../models/giaPhongModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await GiaPhong.findAll({
      include: [{ model: db.Phong }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await GiaPhong.findByPk(req.params.id, {
      include: [{ model: db.Phong }],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy giá phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { maPhong } = req.body;
    if (!maPhong) {
      return res.status(400).json({ message: "Thiếu mã phòng" });
    }
    // Kiểm tra Phong tồn tại
    const phong = await db.Phong.findByPk(maPhong);
    if (!phong) {
      return res.status(400).json({ message: "Phòng không tồn tại" });
    }
    const newItem = await GiaPhong.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await GiaPhong.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy giá phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await GiaPhong.destroy({
      where: { maGiaPhong: req.params.id },
    });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy giá phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await GiaPhong.findAll({
      where: {
        tenGia: { [Op.like]: `%${q}%` },
      },
      include: [{ model: db.Phong }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
