const express = require("express");
const { getAll, getById } = require("../controllers/thanhToanController");
const router = express.Router();

router.get("/thanhtoan/getall", getAll);
router.get("/thanhtoan/getbyid/:id", getById);

module.exports = router;
