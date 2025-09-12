const KhachSan = require("../models/khachSanModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await KhachSan.findAll({
      include: [
        { model: db.Phong },
        { model: db.TienNghiPhong },
        { model: db.GiaPhuPhi },
        { model: db.DanhGia },
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
        { model: db.TienNghiPhong },
        { model: db.GiaPhuPhi },
        { model: db.DanhGia },
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
    const newItem = await KhachSan.create(req.body);
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
          { loaiHinh: { [Op.like]: `%${q}%` } },
        ],
      },
      include: [
        { model: db.Phong },
        { model: db.TienNghiPhong },
        { model: db.GiaPhuPhi },
        { model: db.DanhGia },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
