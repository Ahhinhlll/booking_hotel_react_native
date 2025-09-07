const express = require("express");
const { getAll, getById } = require("../controllers/giaPhuPhiController");
const router = express.Router();

router.get("/giaphuphi/getall", getAll);
router.get("/giaphuphi/getbyid/:id", getById);

module.exports = router;
