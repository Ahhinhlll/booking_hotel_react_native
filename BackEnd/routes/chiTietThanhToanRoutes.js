const express = require("express");
const {
  getAll,
  getById,
} = require("../controllers/chiTietThanhToanController");
const router = express.Router();

router.get("/chitietthanhtoan/getall", getAll);
router.get("/chitietthanhtoan/getbyid/:id", getById);

module.exports = router;
