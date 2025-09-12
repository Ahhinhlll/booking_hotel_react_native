const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/khuyenMaiController");
const router = express.Router();

router.get("/khuyenmai/getall", getAll);
router.get("/khuyenmai/getbyid/:id", getById);
router.post("/khuyenmai/insert", insert);
router.put("/khuyenmai/update", update);
router.delete("/khuyenmai/delete/:id", remove);
router.get("/khuyenmai/search", search);

module.exports = router;
