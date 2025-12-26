const express = require("express");
const router = express.Router();
const momoController = require("../controllers/momoController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Tạo link thanh toán MoMo (cần đăng nhập)
router.post("/momo/create-payment", verifyToken, momoController.createPayment);

// Callback từ MoMo (IPN) - không cần auth vì MoMo gọi
router.post("/momo/callback", momoController.momoCallback);

// Redirect sau khi thanh toán - không cần auth
router.get("/momo/result", momoController.paymentResult);

// Kiểm tra trạng thái giao dịch
router.post("/momo/check-status", verifyToken, momoController.checkTransactionStatus);

module.exports = router;
