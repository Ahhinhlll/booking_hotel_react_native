const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
  updatePassword,
} = require("../controllers/nguoiDungController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/authorizeRole");

const router = express.Router();

router.get("/nguoidung/getall", getAll);
router.get("/nguoidung/getbyid/:id", getById);
router.post("/nguoidung/insert", insert);
router.put("/nguoidung/update", update);
router.delete("/nguoidung/delete/:id", remove);
router.get("/nguoidung/search", search);
router.patch("/nguoidung/updatepassword", updatePassword);

module.exports = router;
