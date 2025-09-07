const express = require("express");
const {
  login,
  refreshToken,
  logout,
} = require("../controllers/authController");
const router = express.Router();

router.post("/auth/login", login);
router.post("/auth/refresh-token", refreshToken);
router.post("/auth/logout", logout);

module.exports = router;
