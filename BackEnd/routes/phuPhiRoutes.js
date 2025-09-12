const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/phuPhiController");
const router = express.Router();

router.get("/phuphi/getall", getAll);
router.get("/phuphi/getbyid/:id", getById);
router.post("/phuphi/insert", insert);
router.put("/phuphi/update", update);
router.delete("/phuphi/delete/:id", remove);
router.get("/phuphi/search", search);

module.exports = router;
