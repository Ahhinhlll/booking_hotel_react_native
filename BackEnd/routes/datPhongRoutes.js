const express = require("express");
const { getAll, getById } = require("../controllers/datPhongController");
const router = express.Router();

router.get("/datphong/getall", getAll);
router.get("/datphong/getbyid/:id", getById);

module.exports = router;
