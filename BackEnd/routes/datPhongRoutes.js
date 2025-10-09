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
} = require("../controllers/datPhongController");
const router = express.Router();

// Routes cho datphong
router.get("/datphong/getall", getAll);
router.get("/datphong/getbyid/:id", getById);
router.post("/datphong/insert", insert);
router.put("/datphong/update", update);
router.delete("/datphong/delete/:id", remove);
router.get("/datphong/search", search);
router.get("/datphong/getbyuser/:userId", getByUserId);
router.put("/datphong/updatestatus/:id", updateStatus);

// New API endpoints for booking confirmation
router.post("/datphong/confirm", confirmBooking);
router.post("/datphong/calculate-price", calculatePrice);
router.get("/datphong/check-availability", checkAvailability);

module.exports = router;
