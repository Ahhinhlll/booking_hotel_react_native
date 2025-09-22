const DatPhong = require("../models/datPhongModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await DatPhong.findAll({
      include: [
        { model: db.NguoiDung },
        { model: db.KhachSan },
        { model: db.Phong },
        { model: db.KhuyenMai },
        { model: db.ThanhToan },
        { model: db.SuCo },
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
    const item = await DatPhong.findByPk(req.params.id, {
      include: [
        { model: db.NguoiDung },
        { model: db.KhachSan },
        { model: db.Phong },
        { model: db.KhuyenMai },
        { model: db.ThanhToan },
        { model: db.SuCo },
        { model: db.DanhGia },
      ],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy đặt phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const db = require("../models");
    const { maND, maPhong, maGiaPhong, maTTDP, maKM } = req.body;
    // Kiểm tra foreign key bắt buộc
    if (!maND || !maPhong || !maGiaPhong || !maTTDP) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc (maND, maPhong, maGiaPhong, maTTDP)",
      });
    }
    // Kiểm tra NguoiDung
    const nguoiDung = await db.NguoiDung.findByPk(maND);
    if (!nguoiDung)
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    // Kiểm tra Phong
    const phong = await db.Phong.findByPk(maPhong);
    if (!phong) return res.status(400).json({ message: "Phòng không tồn tại" });
    // Kiểm tra GiaPhong
    const giaPhong = await db.GiaPhong.findByPk(maGiaPhong);
    if (!giaPhong)
      return res.status(400).json({ message: "Giá phòng không tồn tại" });
    // Kiểm tra TrangThaiDatPhong
    const trangThai = await db.TrangThaiDatPhong.findByPk(maTTDP);
    if (!trangThai)
      return res
        .status(400)
        .json({ message: "Trạng thái đặt phòng không tồn tại" });
    // Nếu có maKM thì kiểm tra
    if (maKM) {
      const khuyenMai = await db.KhuyenMai.findByPk(maKM);
      if (!khuyenMai)
        return res.status(400).json({ message: "Khuyến mãi không tồn tại" });
    }
    const newItem = await DatPhong.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await DatPhong.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy đặt phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await DatPhong.destroy({
      where: { maDatPhong: req.params.id },
    });
    if (deleted) res.status(200).json({ message: "Xóa thành công" });
    else res.status(404).json({ message: "Không tìm thấy đặt phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await DatPhong.findAll({
      where: {
        maDatPhong: { [Op.like]: `%${q}%` },
      },
      include: [
        { model: db.NguoiDung },
        { model: db.KhachSan },
        { model: db.Phong },
        { model: db.KhuyenMai },
        { model: db.ThanhToan },
        { model: db.SuCo },
        { model: db.DanhGia },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
