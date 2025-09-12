const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/chiTietThanhToanController");
const router = express.Router();

router.get("/chitietthanhtoan/getall", getAll);
router.get("/chitietthanhtoan/getbyid/:id", getById);
router.post("/chitietthanhtoan/insert", insert);
router.put("/chitietthanhtoan/update", update);
router.delete("/chitietthanhtoan/delete/:id", remove);
router.get("/chitietthanhtoan/search", search);

module.exports = router;
