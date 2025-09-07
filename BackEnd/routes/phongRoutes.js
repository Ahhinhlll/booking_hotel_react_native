const express = require("express");
const { getAll, getById } = require("../controllers/phongController");
const router = express.Router();

router.get("/phong/getall", getAll);
router.get("/phong/getbyid/:id", getById);

module.exports = router;
