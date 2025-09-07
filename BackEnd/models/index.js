const NguoiDung = require("./nguoiDungModel");
const VaiTro = require("./vaiTroModel");
const KhachSan = require("./khachSanModel");
const LoaiPhong = require("./loaiPhongModel");
const Phong = require("./phongModel");
const GiaPhong = require("./giaPhongModel");
const TienNghi = require("./tienNghiModel");
const TienNghiPhong = require("./tienNghiPhongModel");
const TrangThaiDatPhong = require("./trangThaiDatPhongModel");
const KhuyenMai = require("./khuyenMaiModel");
const DatPhong = require("./datPhongModel");
const GioDatPhong = require("./gioDatPhongModel");
const LoaiPhuPhi = require("./loaiPhuPhiModel");
const PhuPhi = require("./phuPhiModel");
const GiaPhuPhi = require("./giaPhuPhiModel");
const ThanhToan = require("./thanhToanModel");
const ChiTietThanhToan = require("./chiTietThanhToanModel");
const DanhGia = require("./danhGiaModel");

const db = {
  NguoiDung,
  VaiTro,
  KhachSan,
  LoaiPhong,
  Phong,
  GiaPhong,
  TienNghi,
  TienNghiPhong,
  TrangThaiDatPhong,
  KhuyenMai,
  DatPhong,
  GioDatPhong,
  LoaiPhuPhi,
  PhuPhi,
  GiaPhuPhi,
  ThanhToan,
  ChiTietThanhToan,
  DanhGia,
};

//
Object.keys(db).forEach(function (modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
