const KhuyenMai = require("../models/khuyenMaiModel");
const { Op } = require("sequelize");
exports.getAll = async (req, res) => {
  try {
    const items = await KhuyenMai.findAll({
      // include: [ { model: ... } ]
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await KhuyenMai.findByPk(req.params.id, {
      // include: [ { model: ... } ]
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const newItem = await KhuyenMai.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await KhuyenMai.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await KhuyenMai.destroy({ where: { maKM: req.params.id } });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await KhuyenMai.findAll({
      where: {
        tenKM: { [Op.like]: `%${q}%` },
      },
      // include: [ { model: ... } ]
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
