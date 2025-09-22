const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/tienNghiChiTietController");
const router = express.Router();

router.get("/tiennghichitiet/getall", getAll);
router.get("/tiennghichitiet/getbyid/:id", getById);
router.post("/tiennghichitiet/insert", insert);
router.put("/tiennghichitiet/update", update);
router.delete("/tiennghichitiet/delete/:id", remove);
router.get("/tiennghichitiet/search", search);

module.exports = router;
