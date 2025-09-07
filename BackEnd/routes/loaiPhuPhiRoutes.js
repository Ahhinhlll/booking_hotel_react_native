const express = require("express");
const { getAll, getById } = require("../controllers/loaiPhuPhiController");
const router = express.Router();

router.get("/loaiphuphi/getall", getAll);
router.get("/loaiphuphi/getbyid/:id", getById);

module.exports = router;
