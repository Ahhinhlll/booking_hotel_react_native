const express = require("express");
const {
  uploadImage,
  getAllImages,
} = require("../controllers/upLoadController");
const router = express.Router();

router.post("/upload", uploadImage);
router.get("/images", getAllImages);

module.exports = router;
