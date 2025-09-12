const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/gioDatPhongController");
const router = express.Router();

router.get("/giodatphong/getall", getAll);
router.get("/giodatphong/getbyid/:id", getById);
router.post("/giodatphong/insert", insert);
router.put("/giodatphong/update", update);
router.delete("/giodatphong/delete/:id", remove);
router.get("/giodatphong/search", search);

module.exports = router;
