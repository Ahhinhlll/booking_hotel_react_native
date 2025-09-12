const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/giaPhongController");
const router = express.Router();

router.get("/giaphong/getall", getAll);
router.get("/giaphong/getbyid/:id", getById);
router.post("/giaphong/insert", insert);
router.put("/giaphong/update", update);
router.delete("/giaphong/delete/:id", remove);
router.get("/giaphong/search", search);

module.exports = router;
