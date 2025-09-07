const express = require("express");
const { getAll, getById } = require("../controllers/gioDatPhongController");
const router = express.Router();

router.get("/giodatphong/getall", getAll);
router.get("/giodatphong/getbyid/:id", getById);

module.exports = router;
