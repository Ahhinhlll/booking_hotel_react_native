const express = require("express");
const { getAll, getById } = require("../controllers/khuyenMaiController");
const router = express.Router();

router.get("/khuyenmai/getall", getAll);
router.get("/khuyenmai/getbyid/:id", getById);

module.exports = router;
