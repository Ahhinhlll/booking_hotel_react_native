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
const khuyenMaiRoutes = require("./routes/khuyenMaiRoutes");
const datPhongRoutes = require("./routes/datPhongRoutes");
const thanhToanRoutes = require("./routes/thanhToanRoutes");
const danhGiaRoutes = require("./routes/danhGiaRoutes");
const suCoRoutes = require("./routes/suCoRoutes");
const uploadRoutes = require("./routes/upLoadRoutes");
const chatBoxRoutes = require("./routes/chatBoxRoutes");
const momoRoutes = require("./routes/momoRoutes");
require("dotenv").config();
const app = express();

app.use(
  cors({
    // In a production environment, you should specify the exact domain of your frontend.
    // For development, reflecting the origin is a common practice, but be aware of security implications.
    origin: (origin, callback) => {
      callback(null, true);
    },
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
app.use("/api", khuyenMaiRoutes);
app.use("/api", datPhongRoutes);
app.use("/api", thanhToanRoutes);
app.use("/api", danhGiaRoutes);
app.use("/api", suCoRoutes);

app.use("/api", uploadRoutes);
app.use("/api/chatbox", chatBoxRoutes);
app.use("/api", momoRoutes);
// Thêm middleware để phục vụ files tĩnh
app.use("/uploads", express.static("public/uploads"));

module.exports = app;
