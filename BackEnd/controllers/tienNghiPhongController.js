const TienNghiPhong = require("../models/tienNghiPhongModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await TienNghiPhong.findAll({
      include: [
        { model: db.Phong, as: "Phong" },
        { model: db.TienNghi, as: "TienNghi" },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await TienNghiPhong.findByPk(req.params.id, {
      include: [
        { model: db.Phong, as: "Phong" },
        { model: db.TienNghi, as: "TienNghi" },
      ],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy tiện nghi phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { maPhong, maTienNghi } = req.body;
    if (!maPhong || !maTienNghi) {
      return res
        .status(400)
        .json({ message: "Thiếu mã phòng hoặc mã tiện nghi" });
    }
    // Kiểm tra Phong tồn tại
    const phong = await db.Phong.findByPk(maPhong);
    if (!phong) {
      return res.status(400).json({ message: "Phòng không tồn tại" });
    }
    // Kiểm tra TienNghi tồn tại
    const tienNghi = await db.TienNghi.findByPk(maTienNghi);
    if (!tienNghi) {
      return res.status(400).json({ message: "Tiện nghi không tồn tại" });
    }
    const newItem = await TienNghiPhong.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await TienNghiPhong.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy tiện nghi phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await TienNghiPhong.destroy({
      where: { maTNKS: req.params.id },
    });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy tiện nghi phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await TienNghiPhong.findAll({
      where: {
        maPhong: { [Op.like]: `%${q}%` },
      },
      include: [
        { model: db.Phong, as: "Phong" },
        { model: db.TienNghi, as: "TienNghi" },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
