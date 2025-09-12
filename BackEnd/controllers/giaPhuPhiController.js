const GiaPhuPhi = require("../models/giaPhuPhiModel");
const { Op } = require("sequelize");
const db = require("../models");

exports.getAll = async (req, res) => {
  try {
    const items = await GiaPhuPhi.findAll({
      include: [
        { model: db.Phong, as: "Phong" },
        { model: db.LoaiPhuPhi, as: "LoaiPhuPhi" },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await GiaPhuPhi.findByPk(req.params.id, {
      include: [
        { model: db.Phong, as: "Phong" },
        { model: db.LoaiPhuPhi, as: "LoaiPhuPhi" },
      ],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy giá phụ phí" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await GiaPhuPhi.findAll({
      where: {
        tenGia: { [Op.like]: `%${q}%` },
      },
      include: [
        { model: db.Phong, as: "Phong" },
        { model: db.LoaiPhuPhi, as: "LoaiPhuPhi" },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await GiaPhuPhi.destroy({
      where: { maGiaPhuPhi: req.params.id },
    });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy giá phụ phí" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const newItem = await GiaPhuPhi.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await GiaPhuPhi.findByPk(req.body.maGiaPhuPhi);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy giá phụ phí" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
