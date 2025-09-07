const express = require("express");
const { getAll, getById } = require("../controllers/tienNghiPhongController");
const router = express.Router();

router.get("/tiennghiphong/getall", getAll);
router.get("/tiennghiphong/getbyid/:id", getById);

module.exports = router;
