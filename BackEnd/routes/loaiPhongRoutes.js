const express = require("express");
const { getAll, getById } = require("../controllers/loaiPhongController");
const router = express.Router();

router.get("/loaiphong/getall", getAll);
router.get("/loaiphong/getbyid/:id", getById);

module.exports = router;
