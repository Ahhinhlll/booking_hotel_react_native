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
    const nguoiDung = await NguoiDung.create({
      hoTen,
      email,
      matKhau,
      sdt,
      diaChi,
      anhNguoiDung,
      maVaiTro: maVaiTro || "VT03", // Mặc định là User nếu không có
      trangThai: "Hoạt động",
    });
    res.status(201).json(nguoiDung);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
      return res
        .status(404)
        .json({
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
