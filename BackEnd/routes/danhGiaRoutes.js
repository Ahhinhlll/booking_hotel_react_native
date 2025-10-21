const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
  getReviewsByHotelId,
  checkReviewStatus,
  updateReviewStatus,
} = require("../controllers/danhGiaController");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/danhgia/getall", getAll);
router.get("/danhgia/getbyid/:id", getById);
router.post("/danhgia/insert", verifyToken, insert);
router.put("/danhgia/update", verifyToken, update);
router.delete("/danhgia/delete/:id", verifyToken, remove);
router.get("/danhgia/search", search);
router.get("/danhgia/hotel/:hotelId", getReviewsByHotelId);
router.get("/danhgia/check-status/:maDatPhong", checkReviewStatus);
router.put("/danhgia/update-status", updateReviewStatus);

module.exports = router;
