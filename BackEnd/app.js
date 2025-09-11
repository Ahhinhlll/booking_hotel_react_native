const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const vaiTroRoutes = require("./routes/vaiTroRoutes");
const nguoiDungRoutes = require("./routes/nguoiDungRoutes");
const khachSanRoutes = require("./routes/khachSanRoutes");
const loaiPhongRoutes = require("./routes/loaiPhongRoutes");
const phongRoutes = require("./routes/phongRoutes");
const giaPhongRoutes = require("./routes/giaPhongRoutes");
const tienNghiRoutes = require("./routes/tienNghiRoutes");
const tienNghiPhongRoutes = require("./routes/tienNghiPhongRoutes");
const trangThaiDatPhongRoutes = require("./routes/trangThaiDatPhongRoutes");
const khuyenMaiRoutes = require("./routes/khuyenMaiRoutes");
const datPhongRoutes = require("./routes/datPhongRoutes");
const gioDatPhongRoutes = require("./routes/gioDatPhongRoutes");
const loaiPhuPhiRoutes = require("./routes/loaiPhuPhiRoutes");
const phuPhiRoutes = require("./routes/phuPhiRoutes");
const giaPhuPhiRoutes = require("./routes/giaPhuPhiRoutes");
const thanhToanRoutes = require("./routes/thanhToanRoutes");
const chiTietThanhToanRoutes = require("./routes/chiTietThanhToanRoutes");
const danhGiaRoutes = require("./routes/danhGiaRoutes");
const uploadRoutes = require("./routes/upLoadRoutes");
require("dotenv").config();
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", vaiTroRoutes);
app.use("/api", nguoiDungRoutes);
app.use("/api", khachSanRoutes);
app.use("/api", loaiPhongRoutes);
app.use("/api", phongRoutes);
app.use("/api", giaPhongRoutes);
app.use("/api", tienNghiRoutes);
app.use("/api", tienNghiPhongRoutes);
app.use("/api", trangThaiDatPhongRoutes);
app.use("/api", khuyenMaiRoutes);
app.use("/api", datPhongRoutes);
app.use("/api", gioDatPhongRoutes);
app.use("/api", loaiPhuPhiRoutes);
app.use("/api", phuPhiRoutes);
app.use("/api", giaPhuPhiRoutes);
app.use("/api", thanhToanRoutes);
app.use("/api", chiTietThanhToanRoutes);
app.use("/api", danhGiaRoutes);
app.use("/api", uploadRoutes);
// Thêm middleware để phục vụ files tĩnh
app.use("/uploads", express.static("public/uploads"));

module.exports = app;
