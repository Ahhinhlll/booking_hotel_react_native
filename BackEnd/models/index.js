const NguoiDung = require("./nguoiDungModel");
const VaiTro = require("./vaiTroModel");
const KhachSan = require("./khachSanModel");
const LoaiPhong = require("./loaiPhongModel");
const Phong = require("./phongModel");
const GiaPhong = require("./giaPhongModel");
const TienNghi = require("./tienNghiModel");
const KhuyenMai = require("./khuyenMaiModel");
const DatPhong = require("./datPhongModel");
const ThanhToan = require("./thanhToanModel");
const DanhGia = require("./danhGiaModel");
const SuCo = require("./suCoModel");

const db = {
  NguoiDung,
  VaiTro,
  KhachSan,
  LoaiPhong,
  Phong,
  GiaPhong,
  TienNghi,
  KhuyenMai,
  DatPhong,
  ThanhToan,
  DanhGia,
  SuCo,
};

//
Object.keys(db).forEach(function (modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
