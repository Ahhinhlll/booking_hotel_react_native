const KhuyenMai = require("../models/khuyenMaiModel");
const { Op } = require("sequelize");
const db = require("../models");

exports.getAll = async (req, res) => {
  try {
    const items = await KhuyenMai.findAll({
      include: [{ model: db.KhachSan, attributes: ["tenKS"] }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await KhuyenMai.findByPk(req.params.id, {
      include: [{ model: db.KhachSan, attributes: ["tenKS"] }],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { tenKM } = req.body;
    if (!tenKM) {
      return res.status(400).json({ message: "Thiếu tên khuyến mãi" });
    }
    // Kiểm tra tên khuyến mãi đã tồn tại chưa
    const existed = await KhuyenMai.findOne({ where: { tenKM } });
    if (existed) {
      return res.status(400).json({ message: "Tên khuyến mãi đã tồn tại" });
    }
    const newItem = await KhuyenMai.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const maKM = req.params.id || req.body.maKM;
    const item = await KhuyenMai.findByPk(maKM);
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
      include: [{ model: db.KhachSan, attributes: ["tenKS"] }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
