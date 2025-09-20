const express = require("express");
const {
  getAll,
  getById,
  getByKhachSan,
  insert,
  update,
  remove,
  search,
} = require("../controllers/phongController");
const router = express.Router();

router.get("/phong/getall", getAll);
router.get("/phong/getbyid/:id", getById);
router.get("/phong/getbykhachsan/:maKS", getByKhachSan);
router.post("/phong/insert", insert);
router.put("/phong/update", update);
router.delete("/phong/delete/:id", remove);
router.get("/phong/search", search);

module.exports = router;
