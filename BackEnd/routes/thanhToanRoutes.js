const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/thanhToanController");
const router = express.Router();

router.get("/thanhtoan/getall", getAll);
router.get("/thanhtoan/getbyid/:id", getById);
router.post("/thanhtoan/insert", insert);
router.put("/thanhtoan/update", update);
router.delete("/thanhtoan/delete/:id", remove);
router.get("/thanhtoan/search", search);

module.exports = router;
