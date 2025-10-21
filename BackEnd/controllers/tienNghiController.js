const TienNghi = require("../models/tienNghiModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await TienNghi.findAll();
    res.status(200).json(items);
  } catch (error) {
    console.error('Error in getAll:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await TienNghi.findByPk(req.params.id);
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy tiện nghi" });
  } catch (error) {
    console.error('Error in getById:', error);
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
    if (!req.body.maTienNghi) {
      return res.status(400).json({ message: "Thiếu mã tiện nghi" });
    }
    
    const item = await TienNghi.findByPk(req.body.maTienNghi);
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
    });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error in search:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getByHotelId = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const items = await TienNghi.findAll({
      where: {
        [Op.or]: [
          { maKS: null, maPhong: null } // Chỉ tiện ích chung
        ]
      },
    });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error in getByHotelId:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    // Lấy phòng để biết khách sạn của nó
    const room = await db.Phong.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }
    
    const items = await TienNghi.findAll({
      where: {
        [Op.or]: [
          { maPhong: roomId },                    // Tiện ích phòng cụ thể
          { maKS: room.maKS, maPhong: null },     // Tiện ích khách sạn (hiển thị ở tất cả phòng của khách sạn)
          { maKS: null, maPhong: null }           // Tiện ích chung (hiển thị ở tất cả phòng)
        ]
      },
    });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error in getByRoomId:', error);
    res.status(400).json({ error: error.message });
  }
};
