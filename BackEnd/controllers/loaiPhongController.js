const LoaiPhong = require("../models/loaiPhongModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await LoaiPhong.findAll({
      include: [
        { model: db.Phong, as: "Phongs" },
        { model: db.GiaPhong, as: "GiaPhongs" },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await LoaiPhong.findByPk(req.params.id, {
      include: [
        { model: db.Phong, as: "Phongs" },
        { model: db.GiaPhong, as: "GiaPhongs" },
      ],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy loại phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { tenLoaiPhong } = req.body;
    if (!tenLoaiPhong) {
      return res.status(400).json({ message: "Thiếu tên loại phòng" });
    }
    // Kiểm tra tên loại phòng đã tồn tại chưa
    const existed = await LoaiPhong.findOne({ where: { tenLoaiPhong } });
    if (existed) {
      return res.status(400).json({ message: "Tên loại phòng đã tồn tại" });
    }
    const newItem = await LoaiPhong.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await LoaiPhong.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy loại phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await LoaiPhong.destroy({
      where: { maLoaiPhong: req.params.id },
    });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy loại phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await LoaiPhong.findAll({
      where: {
        tenLoaiPhong: { [Op.like]: `%${q}%` },
      },
      include: [
        { model: db.Phong, as: "Phongs" },
        { model: db.GiaPhong, as: "GiaPhongs" },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
