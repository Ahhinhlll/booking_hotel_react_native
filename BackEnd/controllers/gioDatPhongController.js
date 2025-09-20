const GioDatPhong = require("../models/gioDatPhongModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await GioDatPhong.findAll({
      include: [{ model: db.DatPhong, as: "DatPhong" }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await GioDatPhong.findByPk(req.params.id, {
      include: [{ model: db.DatPhong, as: "DatPhong" }],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy giờ đặt phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { maDatPhong } = req.body;
    if (!maDatPhong) {
      return res.status(400).json({ message: "Thiếu mã đặt phòng" });
    }
    // Kiểm tra DatPhong tồn tại
    const datPhong = await db.DatPhong.findByPk(maDatPhong);
    if (!datPhong) {
      return res.status(400).json({ message: "Đặt phòng không tồn tại" });
    }
    const newItem = await GioDatPhong.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await GioDatPhong.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy giờ đặt phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await GioDatPhong.destroy({
      where: { maGDP: req.params.id },
    });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy giờ đặt phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await GioDatPhong.findAll({
      where: {
        gioNhan: { [Op.like]: `%${q}%` },
      },
      include: [{ model: db.DatPhong, as: "DatPhong" }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
