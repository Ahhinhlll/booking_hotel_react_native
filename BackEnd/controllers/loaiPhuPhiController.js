const LoaiPhuPhi = require("../models/loaiPhuPhiModel");
const db = require("../models");
const { Op } = require("sequelize");
exports.getAll = async (req, res) => {
  try {
    const items = await LoaiPhuPhi.findAll({
      include: [
        { model: db.GiaPhuPhi, as: "GiaPhuPhis" },
        { model: db.PhuPhi, as: "PhuPhis" },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await LoaiPhuPhi.findByPk(req.params.id, {
      include: [
        { model: db.GiaPhuPhi, as: "GiaPhuPhis" },
        { model: db.PhuPhi, as: "PhuPhis" },
      ],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy loại phụ phí" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const newItem = await LoaiPhuPhi.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await LoaiPhuPhi.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy loại phụ phí" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await LoaiPhuPhi.destroy({
      where: { maLoaiPhuPhi: req.params.id },
    });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy loại phụ phí" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await LoaiPhuPhi.findAll({
      where: {
        tenLoaiPhuPhi: { [Op.like]: `%${q}%` },
      },
      include: [
        { model: db.GiaPhuPhi, as: "GiaPhuPhis" },
        { model: db.PhuPhi, as: "PhuPhis" },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
