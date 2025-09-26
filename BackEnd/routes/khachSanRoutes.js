const express = require("express");
const {
  getAll,
  getById,
  insert,
  update,
  remove,
  search,
  getRecentHotels,
  searchByImage,
} = require("../controllers/khachSanController");
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });
const router = express.Router();

router.get("/khachsan/getall", getAll);
router.get("/khachsan/recent", getRecentHotels);
router.get("/khachsan/getbyid/:id", getById);
router.post("/khachsan/insert", insert);
router.put("/khachsan/update", update);
router.delete("/khachsan/delete/:id", remove);
router.get("/khachsan/search", search);
// Tìm kiếm khách sạn bằng hình ảnh
router.post("/khachsan/search-by-image", upload.single("image"), searchByImage);

module.exports = router;
