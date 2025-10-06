const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Xác nhận đặt phòng và xử lý thanh toán
router.post("/confirm", bookingController.confirmBooking);

// Tính giá trước khi đặt phòng
router.post("/calculate-price", bookingController.calculatePrice);

// Kiểm tra tính khả dụng của phòng
router.get("/check-availability", bookingController.checkAvailability);

module.exports = router;
