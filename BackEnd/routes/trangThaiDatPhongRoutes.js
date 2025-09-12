const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/trangThaiDatPhongController");
const router = express.Router();

router.get("/trangthaidatphong/getall", getAll);
router.get("/trangthaidatphong/getbyid/:id", getById);
router.post("/trangthaidatphong/insert", insert);
router.put("/trangthaidatphong/update", update);
router.delete("/trangthaidatphong/delete/:id", remove);
router.get("/trangthaidatphong/search", search);

module.exports = router;
