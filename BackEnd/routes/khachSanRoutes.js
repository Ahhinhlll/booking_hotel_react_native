const express = require("express");
const { getAll, getById } = require("../controllers/khachSanController");
const router = express.Router();

router.get("/khachsan/getall", getAll);
router.get("/khachsan/getbyid/:id", getById);

module.exports = router;
