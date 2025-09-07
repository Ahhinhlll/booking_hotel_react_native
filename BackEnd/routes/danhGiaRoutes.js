const express = require("express");
const { getAll, getById } = require("../controllers/danhGiaController");
const router = express.Router();

router.get("/danhgia/getall", getAll);
router.get("/danhgia/getbyid/:id", getById);

module.exports = router;
