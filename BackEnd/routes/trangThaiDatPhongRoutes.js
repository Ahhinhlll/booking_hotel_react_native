const express = require("express");
const {
  getAll,
  getById,
} = require("../controllers/trangThaiDatPhongController");
const router = express.Router();

router.get("/trangthaidatphong/getall", getAll);
router.get("/trangthaidatphong/getbyid/:id", getById);

module.exports = router;
