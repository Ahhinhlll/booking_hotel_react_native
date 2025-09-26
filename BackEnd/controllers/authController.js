const jwt = require("jsonwebtoken");
const NguoiDung = require("../models/nguoiDungModel");
const { Op } = require("sequelize");
const md5 = require("md5");
require("dotenv").config();

// Tạo access token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      maNguoiDung: user.maNguoiDung,
      maVaiTro: user.maVaiTro,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Tạo refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      maNguoiDung: user.maNguoiDung,
      maVaiTro: user.maVaiTro,
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );
};

exports.login = async (req, res) => {
  try {
    const { identifier, matKhau } = req.body; // identifier có thể là email hoặc số điện thoại

    // Tìm người dùng theo email hoặc số điện thoại
    const nguoiDung = await NguoiDung.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { sdt: identifier }],
      },
    });

    if (!nguoiDung) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản với email hoặc số điện thoại này",
      });
    }

    const matKhauMd5 = md5(matKhau);
    if (matKhauMd5 !== nguoiDung.matKhau) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    // Kiểm tra trạng thái tài khoản
    if (nguoiDung.trangThai !== "Hoạt động") {
      return res.status(403).json({
        message: "Tài khoản đã bị khóa hoặc không hoạt động",
      });
    }

    // Tạo tokens
    const accessToken = generateAccessToken(nguoiDung);
    const refreshToken = generateRefreshToken(nguoiDung);

    // Lưu refresh token vào database (có thể thêm trường refreshToken vào model NguoiDung)
    await nguoiDung.update({ refreshToken });

    res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        maNguoiDung: nguoiDung.maNguoiDung,
        hoTen: nguoiDung.hoTen,
        email: nguoiDung.email,
        sdt: nguoiDung.sdt,
        maVaiTro: nguoiDung.maVaiTro,
        trangThai: nguoiDung.trangThai,
        diaChi: nguoiDung.diaChi,
        anhNguoiDung: nguoiDung.anhNguoiDung,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Tìm user và kiểm tra refresh token có match với trong database không
    const nguoiDung = await NguoiDung.findOne({
      where: {
        maNguoiDung: decoded.maNguoiDung,
        refreshToken: refreshToken,
      },
    });

    if (!nguoiDung) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Tạo access token mới
    const newAccessToken = generateAccessToken(nguoiDung);

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Xóa refresh token trong database
    await NguoiDung.update({ refreshToken: null }, { where: { refreshToken } });

    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
