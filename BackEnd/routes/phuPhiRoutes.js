const express = require("express");
const { getAll, getById } = require("../controllers/phuPhiController");
const router = express.Router();

router.get("/phuphi/getall", getAll);
router.get("/phuphi/getbyid/:id", getById);

module.exports = router;
