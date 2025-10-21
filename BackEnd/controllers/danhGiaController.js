const DanhGia = require("../models/danhGiaModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await DanhGia.findAll({
      include: [
        { model: db.NguoiDung },
        { model: db.KhachSan },
        // Bỏ include DatPhong vì đã không còn association
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
        // Bỏ include DatPhong vì đã không còn association
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

    // Kiểm tra số sao hợp lệ (1-5)
    if (soSao < 1 || soSao > 5 || !Number.isInteger(soSao)) {
      return res
        .status(400)
        .json({ message: "Số sao phải là số nguyên từ 1 đến 5" });
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

    // Kiểm tra người dùng đã đánh giá khách sạn này chưa
    // Kiểm tra trong completedBookings.json thay vì database
    if (req.body.maDatPhong) {
      const fs = require("fs");
      const path = require("path");
      const completedBookingsPath = path.join(
        __dirname,
        "../data/completedBookings.json"
      );

      try {
        const completedBookingsData = JSON.parse(
          fs.readFileSync(completedBookingsPath, "utf8")
        );

        const booking = completedBookingsData.completedBookings.find(
          (booking) => booking.maDP === req.body.maDatPhong
        );

        if (booking) {
          console.log("🔍 Booking hasReviewed:", booking.hasReviewed);
        }

        if (booking && booking.hasReviewed === true) {
          return res
            .status(400)
            .json({ message: "Bạn đã đánh giá khách sạn này rồi" });
        }
      } catch (error) {
        console.log("Error reading completedBookings.json:", error);
        // Fallback: kiểm tra trong database nếu không đọc được file
        const existingReview = await DanhGia.findOne({
          where: { maND: maND, maKS: maKS },
        });
        if (existingReview) {
          return res
            .status(400)
            .json({ message: "Bạn đã đánh giá khách sạn này rồi" });
        }
      }
    } else {
      // Nếu không có maDatPhong, kiểm tra trong database
      const existingReview = await DanhGia.findOne({
        where: { maND: maND, maKS: maKS },
      });
      if (existingReview) {
        return res
          .status(400)
          .json({ message: "Bạn đã đánh giá khách sạn này rồi" });
      }
    }

    // Kiểm tra người dùng đã có booking hoàn thành tại khách sạn này chưa
    // Vì booking có thể đã được chuyển sang completedBookings.json,
    // chúng ta sẽ kiểm tra trong file JSON thay vì database
    if (req.body.maDatPhong) {
      const fs = require("fs");
      const path = require("path");
      const completedBookingsPath = path.join(
        __dirname,
        "../data/completedBookings.json"
      );

      let hasCompletedBooking = false;

      // Kiểm tra trong database trước
      const booking = await db.DatPhong.findOne({
        where: {
          maDatPhong: req.body.maDatPhong,
          maND: maND,
          maKS: maKS,
          trangThai: { [Op.in]: ["Đã trả phòng", "Hoàn thành"] },
        },
      });

      if (booking) {
        hasCompletedBooking = true;
      } else if (fs.existsSync(completedBookingsPath)) {
        // Kiểm tra trong completedBookings.json
        try {
          const data = fs.readFileSync(completedBookingsPath, "utf8");
          const completedBookingsData = JSON.parse(data);

          const completedBooking = completedBookingsData.completedBookings.find(
            (booking) =>
              booking.maDP === req.body.maDatPhong &&
              booking.maND === maND &&
              booking.maKS === maKS
          );

          if (completedBooking) {
            hasCompletedBooking = true;
          }
        } catch (error) {
          console.log("Error reading completedBookings.json:", error);
        }
      }

      if (!hasCompletedBooking) {
        return res.status(400).json({
          message: "Chỉ có thể đánh giá sau khi hoàn thành đặt phòng",
        });
      }
    }

    const newItem = await DanhGia.create(req.body);

    // Cập nhật lại thông tin đánh giá cho khách sạn
    await updateKhachSanRating(maKS);

    // Cập nhật hasReviewed = true trong completedBookings.json
    if (req.body.maDatPhong) {
      const fs = require("fs");
      const path = require("path");
      const completedBookingsPath = path.join(
        __dirname,
        "../data/completedBookings.json"
      );

      if (fs.existsSync(completedBookingsPath)) {
        try {
          const data = fs.readFileSync(completedBookingsPath, "utf8");
          const completedBookingsData = JSON.parse(data);

          // Tìm và cập nhật hasReviewed = true
          console.log(
            "🔍 Updating hasReviewed for maDatPhong:",
            req.body.maDatPhong
          );
          console.log(
            "🔍 Available bookings for update:",
            completedBookingsData.completedBookings.map((b) => b.maDP)
          );

          const bookingIndex =
            completedBookingsData.completedBookings.findIndex(
              (booking) => booking.maDP === req.body.maDatPhong
            );

          if (bookingIndex !== -1) {
            completedBookingsData.completedBookings[
              bookingIndex
            ].hasReviewed = true;
            completedBookingsData.lastUpdated = new Date().toISOString();

            // Ghi lại file
            fs.writeFileSync(
              completedBookingsPath,
              JSON.stringify(completedBookingsData, null, 2)
            );
          } else {
            console.log(
              "❌ Booking not found for maDatPhong:",
              req.body.maDatPhong
            );
          }
        } catch (error) {
          console.log(
            "Error updating hasReviewed in completedBookings.json:",
            error
          );
        }
      }
    }

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
    if (!req.body.maDG) {
      return res.status(400).json({ message: "Thiếu mã đánh giá" });
    }

    const item = await DanhGia.findByPk(req.body.maDG);
    if (item) {
      // Kiểm tra số sao hợp lệ nếu có trong request
      if (req.body.soSao !== undefined) {
        if (
          req.body.soSao < 1 ||
          req.body.soSao > 5 ||
          !Number.isInteger(req.body.soSao)
        ) {
          return res
            .status(400)
            .json({ message: "Số sao phải là số nguyên từ 1 đến 5" });
        }
      }

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

      // Cập nhật hasReviewed = false trong completedBookings.json
      const fs = require("fs");
      const path = require("path");
      const completedBookingsPath = path.join(
        __dirname,
        "../data/completedBookings.json"
      );

      if (fs.existsSync(completedBookingsPath)) {
        try {
          const data = fs.readFileSync(completedBookingsPath, "utf8");
          const completedBookingsData = JSON.parse(data);

          const bookingIndex =
            completedBookingsData.completedBookings.findIndex(
              (booking) => booking.maDP === item.maDatPhong
            );

          if (bookingIndex !== -1) {
            completedBookingsData.completedBookings[
              bookingIndex
            ].hasReviewed = false;
            completedBookingsData.lastUpdated = new Date().toISOString();

            fs.writeFileSync(
              completedBookingsPath,
              JSON.stringify(completedBookingsData, null, 2)
            );
            console.log(
              "✅ Updated hasReviewed to false for booking:",
              item.maDatPhong
            );
          }
        } catch (error) {
          console.log(
            "Error updating hasReviewed in completedBookings.json:",
            error
          );
        }
      }

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
        // Bỏ include DatPhong vì đã không còn association
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// API để kiểm tra trạng thái review của một booking
exports.checkReviewStatus = async (req, res) => {
  try {
    const { maDatPhong } = req.params;

    if (!maDatPhong) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã đặt phòng",
      });
    }

    // Kiểm tra trong database
    const review = await DanhGia.findOne({
      where: { maDatPhong: maDatPhong },
    });

    // Kiểm tra trong completedBookings.json
    const fs = require("fs");
    const path = require("path");
    const completedBookingsPath = path.join(
      __dirname,
      "../data/completedBookings.json"
    );

    let hasReviewed = false;
    if (fs.existsSync(completedBookingsPath)) {
      try {
        const data = fs.readFileSync(completedBookingsPath, "utf8");
        const completedBookingsData = JSON.parse(data);

        const completedBooking = completedBookingsData.completedBookings.find(
          (booking) => booking.maDP === maDatPhong
        );

        if (completedBooking) {
          hasReviewed = completedBooking.hasReviewed || false;
        }
      } catch (error) {
        console.log("Error reading completedBookings.json:", error);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        hasReview: !!review,
        hasReviewed: hasReviewed,
        review: review ? review.toJSON() : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// API để cập nhật trạng thái hasReviewed thủ công
exports.updateReviewStatus = async (req, res) => {
  try {
    const { maDatPhong, hasReviewed } = req.body;

    if (!maDatPhong || hasReviewed === undefined) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã đặt phòng hoặc trạng thái review",
      });
    }

    const fs = require("fs");
    const path = require("path");
    const completedBookingsPath = path.join(
      __dirname,
      "../data/completedBookings.json"
    );

    if (fs.existsSync(completedBookingsPath)) {
      try {
        const data = fs.readFileSync(completedBookingsPath, "utf8");
        const completedBookingsData = JSON.parse(data);

        const bookingIndex = completedBookingsData.completedBookings.findIndex(
          (booking) => booking.maDP === maDatPhong
        );

        if (bookingIndex !== -1) {
          completedBookingsData.completedBookings[bookingIndex].hasReviewed =
            hasReviewed;
          completedBookingsData.lastUpdated = new Date().toISOString();

          fs.writeFileSync(
            completedBookingsPath,
            JSON.stringify(completedBookingsData, null, 2)
          );

          res.status(200).json({
            success: true,
            message: `Đã cập nhật hasReviewed = ${hasReviewed} cho booking ${maDatPhong}`,
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Không tìm thấy booking trong completedBookings.json",
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "File completedBookings.json không tồn tại",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// API để lấy reviews theo hotel ID
exports.getReviewsByHotelId = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const reviews = await DanhGia.findAll({
      where: { maKS: hotelId },
      include: [
        {
          model: db.NguoiDung,
          attributes: ["hoTen", "email"],
        },
      ],
      order: [["ngayDG", "DESC"]],
    });

    // Vì DatPhong có thể đã bị xóa khi chuyển sang completed bookings,
    // chúng ta sẽ lấy thông tin phòng từ completedBookings.json
    const fs = require("fs");
    const path = require("path");
    const completedBookingsPath = path.join(
      __dirname,
      "../data/completedBookings.json"
    );

    let completedBookingsData = { completedBookings: [] };
    if (fs.existsSync(completedBookingsPath)) {
      try {
        const data = fs.readFileSync(completedBookingsPath, "utf8");
        completedBookingsData = JSON.parse(data);
      } catch (error) {
        console.log("Error reading completedBookings.json");
      }
    }

    // Enrich reviews với thông tin từ completed bookings
    const enrichedReviews = reviews.map((review) => {
      const completedBooking = completedBookingsData.completedBookings.find(
        (booking) => booking.maDP === review.maDatPhong
      );

      return {
        ...review.toJSON(),
        DatPhong: completedBooking
          ? {
              maDatPhong: completedBooking.maDP,
              Phong: {
                tenPhong: completedBooking.tenPhong,
              },
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedReviews,
      message: "Lấy danh sách đánh giá thành công",
    });
  } catch (error) {
    console.error("Error getting reviews by hotel:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
