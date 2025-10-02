const DanhGia = require("../models/danhGiaModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await DanhGia.findAll({
      include: [
        { model: db.NguoiDung },
        { model: db.KhachSan },
        { model: db.DatPhong },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await DanhGia.findByPk(req.params.id, {
      include: [
        { model: db.NguoiDung },
        { model: db.KhachSan },
        { model: db.DatPhong },
      ],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy đánh giá" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { maND, maKS, soSao } = req.body;
    if (!maND || !maKS || soSao === undefined) {
      return res
        .status(400)
        .json({ message: "Thiếu mã người dùng, mã khách sạn hoặc số sao" });
    }
    // Kiểm tra NguoiDung tồn tại
    const nguoiDung = await db.NguoiDung.findByPk(maND);
    if (!nguoiDung) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }
    // Kiểm tra KhachSan tồn tại
    const khachSan = await db.KhachSan.findByPk(maKS);
    if (!khachSan) {
      return res.status(400).json({ message: "Khách sạn không tồn tại" });
    }
    const newItem = await DanhGia.create(req.body);

    // Cập nhật lại thông tin đánh giá cho khách sạn
    await updateKhachSanRating(maKS);

    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Hàm cập nhật lại thông tin đánh giá cho khách sạn
const updateKhachSanRating = async (maKS) => {
  try {
    // Lấy tất cả đánh giá của khách sạn
    const danhGias = await DanhGia.findAll({
      where: { maKS: maKS },
    });

    if (danhGias.length > 0) {
      // Tính trung bình số sao
      const tongSoSao = danhGias.reduce((sum, dg) => sum + dg.soSao, 0);
      const trungBinhSao = tongSoSao / danhGias.length;

      // Cập nhật lại thông tin cho khách sạn
      await db.KhachSan.update(
        {
          hangSao: Math.round(trungBinhSao), // Làm tròn đến số nguyên
          diemDanhGia: danhGias.length,
        },
        {
          where: { maKS: maKS },
        }
      );
    } else {
      // Nếu không có đánh giá nào, đặt về giá trị mặc định
      await db.KhachSan.update(
        {
          hangSao: 0,
          diemDanhGia: 0,
        },
        {
          where: { maKS: maKS },
        }
      );
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật điểm đánh giá khách sạn:", error);
  }
};

// Hàm cập nhật lại thông tin đánh giá khi cập nhật đánh giá
exports.update = async (req, res) => {
  try {
    const item = await DanhGia.findByPk(req.params.id);
    if (item) {
      const oldMaKS = item.maKS; // Lưu lại mã khách sạn cũ để cập nhật sau

      await item.update(req.body);

      // Cập nhật lại thông tin đánh giá cho cả khách sạn cũ và mới (nếu thay đổi maKS)
      await updateKhachSanRating(oldMaKS);
      if (req.body.maKS && req.body.maKS !== oldMaKS) {
        await updateKhachSanRating(req.body.maKS);
      }

      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy đánh giá" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Hàm cập nhật lại thông tin đánh giá khi xóa đánh giá
exports.remove = async (req, res) => {
  try {
    const item = await DanhGia.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    const maKS = item.maKS; // Lưu lại mã khách sạn để cập nhật sau

    const deleted = await DanhGia.destroy({ where: { maDG: req.params.id } });
    if (deleted) {
      // Cập nhật lại thông tin đánh giá cho khách sạn
      await updateKhachSanRating(maKS);
      res.status(200).json({ message: "Xóa thành công" });
    } else res.status(404).json({ message: "Không tìm thấy đánh giá" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Hàm tìm kiếm đánh giá
exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await DanhGia.findAll({
      where: {
        binhLuan: { [Op.like]: `%${q}%` },
      },
      include: [
        { model: db.NguoiDung },
        { model: db.KhachSan },
        { model: db.DatPhong },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
