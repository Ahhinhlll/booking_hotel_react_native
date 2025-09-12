const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/loaiPhongController");
const router = express.Router();

router.get("/loaiphong/getall", getAll);
router.get("/loaiphong/getbyid/:id", getById);
router.post("/loaiphong/insert", insert);
router.put("/loaiphong/update", update);
router.delete("/loaiphong/delete/:id", remove);
router.get("/loaiphong/search", search);

module.exports = router;
