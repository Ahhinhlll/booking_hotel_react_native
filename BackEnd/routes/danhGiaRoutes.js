const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/danhGiaController");
const router = express.Router();

router.get("/danhgia/getall", getAll);
router.get("/danhgia/getbyid/:id", getById);
router.post("/danhgia/insert", insert);
router.put("/danhgia/update", update);
router.delete("/danhgia/delete/:id", remove);
router.get("/danhgia/search", search);

module.exports = router;
