const express = require("express");
const { getAll, getById } = require("../controllers/vaiTroController");
const router = express.Router();

router.get("/vaitro/getall", getAll);
router.get("/vaitro/getbyid/:id", getById);

module.exports = router;
