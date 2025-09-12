const TrangThaiDatPhong = require("../models/trangThaiDatPhongModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await TrangThaiDatPhong.findAll({
      include: [{ model: db.DatPhong, as: "DatPhongs" }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await TrangThaiDatPhong.findByPk(req.params.id, {
      include: [{ model: db.DatPhong, as: "DatPhongs" }],
    });
    if (item) res.status(200).json(item);
    else
      res.status(404).json({ message: "Không tìm thấy trạng thái đặt phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const newItem = await TrangThaiDatPhong.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await TrangThaiDatPhong.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else
      res.status(404).json({ message: "Không tìm thấy trạng thái đặt phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await TrangThaiDatPhong.destroy({
      where: { maTTDP: req.params.id },
    });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else
      res.status(404).json({ message: "Không tìm thấy trạng thái đặt phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await TrangThaiDatPhong.findAll({
      where: {
        tenTrangThai: { [Op.like]: `%${q}%` },
      },
      include: [{ model: db.DatPhong, as: "DatPhongs" }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
