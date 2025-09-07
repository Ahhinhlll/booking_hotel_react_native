const db = require("../models");
const NguoiDung = require("../models/nguoiDungModel");
const VaiTro = require("../models/vaiTroModel");

const initialRoles = [
  {
    maVaiTro: "VT01",
    tenVT: "Admin",
    moTa: "Quản trị viên",
  },
  {
    maVaiTro: "VT02",
    tenVT: "Staff",
    moTa: "Nhân viên",
  },
  {
    maVaiTro: "VT03",
    tenVT: "User",
    moTa: "Khách hàng",
  },
];

exports.initializeRoles = async () => {
  try {
    for (const role of initialRoles) {
      const [vaiTro, created] = await VaiTro.findOrCreate({
        where: { maVaiTro: role.maVaiTro },
        defaults: role,
      });
      if (created) {
        console.log(`Đã tạo vai trò: ${role.tenVT}`);
      } else {
        console.log(`Vai trò ${role.tenVT} đã tồn tại`);
      }
    }
  } catch (error) {
    console.error("Lỗi khi khởi tạo vai trò:", error);
  }
};

exports.getAll = async (req, res) => {
  try {
    const vaiTros = await db.VaiTro.findAll({
      include: [
        {
          model: NguoiDung,
          as: "NguoiDungs",
        },
      ],
    });
    res.status(200).json(vaiTros);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const vaiTro = await db.VaiTro.findByPk(req.params.id, {
      include: [
        {
          model: NguoiDung,
          as: "NguoiDungs",
        },
      ],
    });
    if (vaiTro) {
      res.status(200).json(vaiTro);
    } else {
      res.status(404).json({ message: "Vai trò không tồn tại" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
