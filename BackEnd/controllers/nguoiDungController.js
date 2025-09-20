const NguoiDung = require("../models/nguoiDungModel");
const { Op } = require("sequelize");
const md5 = require("md5");

exports.getAll = async (req, res) => {
  try {
    const nguoiDungs = await NguoiDung.findAll();
    res.status(200).json(nguoiDungs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const nguoiDung = await NguoiDung.findByPk(req.params.id);
    if (nguoiDung) {
      res.status(200).json(nguoiDung);
    } else {
      res.status(404).json({ message: "Người dùng không tồn tại" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { hoTen, email, matKhau, sdt, diaChi, anhNguoiDung, maVaiTro } =
      req.body;

    // Validate bắt buộc
    if (!hoTen || !email || !matKhau || !sdt) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Validate email
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    // Validate số điện thoại
    if (!/^\d+$/.test(sdt)) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
    }

    // Check tồn tại
    if (await NguoiDung.findOne({ where: { email } })) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    if (await NguoiDung.findOne({ where: { sdt } })) {
      return res.status(400).json({ message: "Số điện thoại đã tồn tại" });
    }

    // Kiểm tra vai trò
    const db = require("../models");
    const vaiTroCode = maVaiTro || "VT03";
    const vaiTro = await db.VaiTro.findByPk(vaiTroCode);
    if (!vaiTro) {
      return res.status(400).json({ message: "Vai trò không tồn tại" });
    }

    // Tạo user
    const nguoiDung = await NguoiDung.create({
      hoTen,
      email,
      matKhau,
      sdt,
      diaChi,
      anhNguoiDung: anhNguoiDung || "/uploads/1758162302817.png",
      maVaiTro: vaiTroCode,
      trangThai: "Hoạt động",
    });

    res.status(201).json(nguoiDung);
  } catch (error) {
    console.error("Insert user error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      maNguoiDung,
      hoTen,
      email,
      sdt,
      diaChi,
      anhNguoiDung,
      maVaiTro,
      trangThai,
    } = req.body;
    const nguoiDung = await NguoiDung.findByPk(maNguoiDung);
    if (nguoiDung !== null) {
      await nguoiDung.update({
        hoTen,
        email,
        sdt,
        diaChi,
        anhNguoiDung,
        maVaiTro,
        trangThai,
      });
      res.status(200).json(nguoiDung);
    } else {
      res.status(404).json({ message: "Người dùng không tồn tại" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const nguoiDung = await NguoiDung.findByPk(req.params.id);
    if (nguoiDung) {
      await nguoiDung.destroy();
      res.status(200).json(nguoiDung);
    } else {
      res.status(404).json({ message: "Người dùng không tồn tại" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const nguoiDungs = await NguoiDung.findAll({
      where: {
        [Op.or]: [
          { hoTen: { [Op.like]: `%${req.query.q}%` } },
          { diaChi: { [Op.like]: `%${req.query.q}%` } },
          { email: { [Op.like]: `%${req.query.q}%` } },
          { sdt: { [Op.like]: `%${req.query.q}%` } },
        ],
      },
    });
    res.status(200).json(nguoiDungs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { email, sdt, matKhauCu, matKhauMoi } = req.body;

    // Tìm người dùng bằng email hoặc số điện thoại
    const nguoiDung = await NguoiDung.findOne({
      where: {
        [Op.or]: [{ email: email || "" }, { sdt: sdt || "" }],
      },
    });

    if (!nguoiDung) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản với email hoặc số điện thoại này",
      });
    }

    // Kiểm tra mật khẩu cũ
    if (nguoiDung.matKhau !== md5(matKhauCu)) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    // Cập nhật mật khẩu mới đã được mã hóa
    const matKhauMoiMd5 = md5(matKhauMoi);
    await nguoiDung.update({ matKhau: matKhauMoiMd5 });

    res.status(200).json({
      message: "Đổi mật khẩu thành công",
      email: nguoiDung.email,
      sdt: nguoiDung.sdt,
      matKhau: matKhauMoiMd5,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
