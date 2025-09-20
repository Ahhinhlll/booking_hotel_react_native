const TienNghi = require("../models/tienNghiModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await TienNghi.findAll({
      include: [{ model: db.TienNghiPhong, as: "TienNghiPhongs" }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await TienNghi.findByPk(req.params.id, {
      include: [{ model: db.TienNghiPhong, as: "TienNghiPhongs" }],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy tiện nghi" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { tenTienNghi } = req.body;
    if (!tenTienNghi) {
      return res.status(400).json({ message: "Thiếu tên tiện nghi" });
    }
    // Kiểm tra tên tiện nghi đã tồn tại chưa
    const existed = await TienNghi.findOne({ where: { tenTienNghi } });
    if (existed) {
      return res.status(400).json({ message: "Tên tiện nghi đã tồn tại" });
    }
    const newItem = await TienNghi.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await TienNghi.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy tiện nghi" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await TienNghi.destroy({
      where: { maTienNghi: req.params.id },
    });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy tiện nghi" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await TienNghi.findAll({
      where: {
        tenTienNghi: { [Op.like]: `%${q}%` },
      },
      include: [{ model: db.TienNghiPhong, as: "TienNghiPhongs" }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
