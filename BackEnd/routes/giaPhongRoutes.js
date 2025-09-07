const express = require("express");
const { getAll, getById } = require("../controllers/giaPhongController");
const router = express.Router();

router.get("/giaphong/getall", getAll);
router.get("/giaphong/getbyid/:id", getById);

module.exports = router;
