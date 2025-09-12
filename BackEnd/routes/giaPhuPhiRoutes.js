const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
} = require("../controllers/giaPhuPhiController");
const router = express.Router();

router.get("/giaphuphi/getall", getAll);
router.get("/giaphuphi/getbyid/:id", getById);
router.post("/giaphuphi/insert", insert);
router.put("/giaphuphi/update", update);
router.delete("/giaphuphi/delete/:id", remove);
router.get("/giaphuphi/search", search);

module.exports = router;
