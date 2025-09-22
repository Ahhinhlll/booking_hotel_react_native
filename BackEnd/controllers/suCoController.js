const SuCo = require("../models/suCoModel");
const { Op } = require("sequelize");
const db = require("../models");

// Lấy tất cả sự cố
exports.getAll = async (req, res) => {
  try {
    const items = await SuCo.findAll({
      include: [{ model: db.DatPhong }, { model: db.Phong }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Lấy sự cố theo id
exports.getById = async (req, res) => {
  try {
    const item = await SuCo.findByPk(req.params.id, {
      include: [{ model: db.DatPhong }, { model: db.Phong }],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy sự cố" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Thêm mới sự cố
exports.insert = async (req, res) => {
  try {
    const { maDatPhong, maPhong } = req.body;
    if (!maDatPhong || !maPhong) {
      return res
        .status(400)
        .json({ message: "Thiếu mã đặt phòng hoặc mã phòng" });
    }
    // Kiểm tra DatPhong tồn tại
    const datPhong = await db.DatPhong.findByPk(maDatPhong);
    if (!datPhong) {
      return res.status(400).json({ message: "Đặt phòng không tồn tại" });
    }
    // Kiểm tra Phong tồn tại
    const phong = await db.Phong.findByPk(maPhong);
    if (!phong) {
      return res.status(400).json({ message: "Phòng không tồn tại" });
    }
    const newItem = await SuCo.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Cập nhật sự cố
exports.update = async (req, res) => {
  try {
    const item = await SuCo.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy sự cố" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Xóa sự cố
exports.remove = async (req, res) => {
  try {
    const deleted = await SuCo.destroy({ where: { maSuCo: req.params.id } });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy sự cố" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Tìm kiếm sự cố theo mô tả
exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await SuCo.findAll({
      where: {
        moTa: { [Op.like]: `%${q}%` },
      },
      include: [{ model: db.DatPhong }, { model: db.Phong }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
