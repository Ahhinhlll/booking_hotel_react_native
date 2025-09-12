const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/loaiPhuPhiController");
const router = express.Router();

router.get("/loaiphuphi/getall", getAll);
router.get("/loaiphuphi/getbyid/:id", getById);
router.post("/loaiphuphi/insert", insert);
router.put("/loaiphuphi/update", update);
router.delete("/loaiphuphi/delete/:id", remove);
router.get("/loaiphuphi/search", search);

module.exports = router;
