const express = require("express");
const { getAll, getById } = require("../controllers/tienNghiController");
const router = express.Router();

router.get("/tiennghi/getall", getAll);
router.get("/tiennghi/getbyid/:id", getById);

module.exports = router;
