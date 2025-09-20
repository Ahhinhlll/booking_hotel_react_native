const PhuPhi = require("../models/phuPhiModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await PhuPhi.findAll({
      include: [{ model: db.LoaiPhuPhi, as: "LoaiPhuPhi" }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await PhuPhi.findByPk(req.params.id, {
      include: [{ model: db.LoaiPhuPhi, as: "LoaiPhuPhi" }],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy phụ phí" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { maDP, maLoaiPhuPhi } = req.body;
    if (!maDP || !maLoaiPhuPhi) {
      return res
        .status(400)
        .json({ message: "Thiếu mã đặt phòng hoặc mã loại phụ phí" });
    }
    // Kiểm tra DatPhong tồn tại
    const datPhong = await db.DatPhong.findByPk(maDP);
    if (!datPhong) {
      return res.status(400).json({ message: "Đặt phòng không tồn tại" });
    }
    // Kiểm tra LoaiPhuPhi tồn tại
    const loaiPhuPhi = await db.LoaiPhuPhi.findByPk(maLoaiPhuPhi);
    if (!loaiPhuPhi) {
      return res.status(400).json({ message: "Loại phụ phí không tồn tại" });
    }
    const newItem = await PhuPhi.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await PhuPhi.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy phụ phí" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await PhuPhi.destroy({
      where: { maPhuPhi: req.params.id },
    });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy phụ phí" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await PhuPhi.findAll({
      where: {
        ghiChu: { [Op.like]: `%${q}%` },
      },
      include: [{ model: db.LoaiPhuPhi, as: "LoaiPhuPhi" }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
