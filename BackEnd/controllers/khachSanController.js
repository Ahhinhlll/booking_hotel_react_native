const path = require("path");
const fs = require("fs");
const KhachSan = require("../models/khachSanModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await KhachSan.findAll({
      include: [
        { model: db.Phong },
        { model: db.KhuyenMai },
        { model: db.DatPhong },
        { model: db.DanhGia },
        { model: db.TienNghiChiTiet },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await KhachSan.findByPk(req.params.id, {
      include: [
        { model: db.Phong },
        { model: db.KhuyenMai },
        { model: db.DatPhong },
        { model: db.DanhGia },
        { model: db.TienNghiChiTiet },
      ],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy khách sạn" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { tenKS } = req.body;
    if (!tenKS) {
      return res.status(400).json({ message: "Thiếu tên khách sạn" });
    }
    // Kiểm tra tên khách sạn đã tồn tại chưa
    const existed = await KhachSan.findOne({ where: { tenKS } });
    if (existed) {
      return res.status(400).json({ message: "Tên khách sạn đã tồn tại" });
    }
    // Đặt giá thấp nhất mặc định là 0
    const requestBody = {
      ...req.body,
      giaThapNhat: 0
    };
    const newItem = await KhachSan.create(requestBody);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      maKS,
      tenKS,
      diaChi,
      dienThoai,
      tinhThanh,
      giaChiTu,
      anh,
      trangThai,
      hangSao,
      loaiHinh,
    } = req.body;

    const khachSan = await KhachSan.findByPk(maKS);
    if (khachSan !== null) {
      await khachSan.update({
        tenKS,
        diaChi,
        dienThoai,
        tinhThanh,
        giaChiTu,
        anh,
        trangThai,
        hangSao,
        loaiHinh,
      });
      res.status(200).json(khachSan);
    } else {
      res.status(404).json({ message: "Khách sạn không tồn tại" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await KhachSan.destroy({ where: { maKS: req.params.id } });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy khách sạn" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await KhachSan.findAll({
      where: {
        [Op.or]: [
          { tenKS: { [Op.like]: `%${q}%` } },
          { diaChi: { [Op.like]: `%${q}%` } },
          { trangThai: { [Op.like]: `%${q}%` } },
          { hangSao: { [Op.like]: `%${q}%` } },
        ],
      },
      include: [
        { model: db.Phong },
        { model: db.KhuyenMai },
        { model: db.DatPhong },
        { model: db.DanhGia },
        { model: db.TienNghiChiTiet },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.searchByImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    // Lấy tên file ảnh upload
    const uploadedFileName = path.basename(req.file.filename);
    // Lấy tất cả khách sạn
    const hotels = await KhachSan.findAll();
    // So khớp: nếu ảnh upload trùng tên với 1 ảnh trong DB thì trả về khách sạn đó
    const matched = hotels.filter((hotel) => {
      if (!hotel.anh) return false;
      const arr = Array.isArray(hotel.anh) ? hotel.anh : [hotel.anh];
      return arr.some((img) => img && path.basename(img) === uploadedFileName);
    });
    if (matched.length > 0) {
      res.json(matched);
    } else {
      res
        .status(404)
        .json({ message: "Không tìm thấy khách sạn phù hợp với ảnh" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Lấy 6 khách sạn có createdAt mới nhất
exports.getRecentHotels = async (req, res) => {
  try {
    const items = await KhachSan.findAll({
      order: [["createdAt", "DESC"]],
      limit: 6,
      include: [
        { model: db.Phong },
        { model: db.KhuyenMai },
        { model: db.DatPhong },
        { model: db.DanhGia },
        { model: db.TienNghiChiTiet },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
