const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/khachSanController");
const router = express.Router();

router.get("/khachsan/getall", getAll);
router.get("/khachsan/getbyid/:id", getById);
router.post("/khachsan/insert", insert);
router.put("/khachsan/update", update);
router.delete("/khachsan/delete/:id", remove);
router.get("/khachsan/search", search);

module.exports = router;
