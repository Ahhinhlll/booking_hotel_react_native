const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/suCoController");
const router = express.Router();

router.get("/suco/getall", getAll);
router.get("/suco/getbyid/:id", getById);
router.post("/suco/insert", insert);
router.put("/suco/update", update);
router.delete("/suco/delete/:id", remove);
router.get("/suco/search", search);

module.exports = router;
