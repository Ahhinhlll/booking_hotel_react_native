const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
  getByUserId,
  updateStatus,
  confirmBooking,
  calculatePrice,
  checkAvailability,
  checkRoomBookingStatus,
  getCompletedBookings,
  getCompletedBookingsByUserId,
  confirmATMPayment,
} = require("../controllers/datPhongController");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// Routes cho datphong
router.get("/datphong/getall", getAll);
router.get("/datphong/getbyid/:id", getById);
router.put("/datphong/update", update);
router.delete("/datphong/delete/:id", remove);
router.get("/datphong/search", search);
router.get("/datphong/getbyuser/:userId", getByUserId);
router.put("/datphong/updatestatus/:id", updateStatus);

// New API endpoints for booking confirmation
router.post("/datphong/insert", verifyToken, insert);
router.post("/datphong/confirm-booking", verifyToken, confirmBooking);
router.post("/datphong/calculate-price", calculatePrice);
router.get("/datphong/check-availability", checkAvailability);
router.get("/datphong/check-room-status/:roomId", checkRoomBookingStatus);

// API endpoints for completed bookings
router.get("/datphong/completed", getCompletedBookings);
router.get("/datphong/completed/user/:userId", getCompletedBookingsByUserId);

// API endpoint for ATM payment confirmation
router.post("/datphong/confirm-atm-payment", verifyToken, confirmATMPayment);

module.exports = router;
