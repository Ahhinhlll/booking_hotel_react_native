const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/tienNghiPhongController");
const router = express.Router();

router.get("/tiennghiphong/getall", getAll);
router.get("/tiennghiphong/getbyid/:id", getById);
router.post("/tiennghiphong/insert", insert);
router.put("/tiennghiphong/update", update);
router.delete("/tiennghiphong/delete/:id", remove);
router.get("/tiennghiphong/search", search);

module.exports = router;
