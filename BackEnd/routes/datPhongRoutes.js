const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/datPhongController");
const router = express.Router();

router.get("/datphong/getall", getAll);
router.get("/datphong/getbyid/:id", getById);
router.post("/datphong/insert", insert);
router.put("/datphong/update", update);
router.delete("/datphong/delete/:id", remove);
router.get("/datphong/search", search);

module.exports = router;
