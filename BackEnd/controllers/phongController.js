const Phong = require("../models/phongModel");
const db = require("../models");
const { Op } = require("sequelize");

// Lấy danh sách phòng theo mã khách sạn
exports.getByKhachSan = async (req, res) => {
  try {
    const { maKS } = req.params;
    if (!maKS) {
      return res.status(400).json({ message: "Thiếu mã khách sạn" });
    }
    const items = await Phong.findAll({
      where: { maKS },
      include: [
        { model: db.KhachSan },
        { model: db.LoaiPhong },
        { model: db.GiaPhong },
        { model: db.KhuyenMai },
        { model: db.DatPhong },
        { model: db.TienNghiChiTiet },
        { model: db.SuCo },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getAll = async (req, res) => {
  try {
    const items = await Phong.findAll({
      include: [
        { model: db.KhachSan },
        { model: db.LoaiPhong },
        { model: db.GiaPhong },
        { model: db.KhuyenMai },
        { model: db.DatPhong },
        { model: db.TienNghiChiTiet },
        { model: db.SuCo },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Phong.findByPk(req.params.id, {
      include: [
        { model: db.KhachSan },
        { model: db.LoaiPhong },
        { model: db.GiaPhong },
        { model: db.KhuyenMai },
        { model: db.DatPhong },
        { model: db.TienNghiChiTiet },
        { model: db.SuCo },
      ],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { maKS, maLoaiPhong } = req.body;
    if (!maKS || !maLoaiPhong) {
      return res
        .status(400)
        .json({ message: "Thiếu mã khách sạn hoặc mã loại phòng" });
    }
    // Kiểm tra KhachSan tồn tại
    const khachSan = await db.KhachSan.findByPk(maKS);
    if (!khachSan) {
      return res.status(400).json({ message: "Khách sạn không tồn tại" });
    }
    // Kiểm tra LoaiPhong tồn tại
    const loaiPhong = await db.LoaiPhong.findByPk(maLoaiPhong);
    if (!loaiPhong) {
      return res.status(400).json({ message: "Loại phòng không tồn tại" });
    }
    const newItem = await Phong.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Phong.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Phong.destroy({ where: { maPhong: req.params.id } });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await Phong.findAll({
      where: {
        tenPhong: { [Op.like]: `%${q}%` },
      },
      include: [
        { model: db.KhachSan },
        { model: db.LoaiPhong },
        { model: db.GiaPhong },
        { model: db.KhuyenMai },
        { model: db.DatPhong },
        { model: db.TienNghiChiTiet },
        { model: db.SuCo },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
