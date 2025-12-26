const express = require("express");
const router = express.Router();
const {
  getAllHotels,
  searchHotels,
  getHotelWithAvailableRooms,
  getHotelAmenities,
  getHotelActivePromotions,
  checkRoomAvailability,
  getHotelFullInfo,
  chatWithAI,
} = require("../controllers/chatBoxController");

// ============== AI CHAT ==============
// Chat với AI (POST vì cần gửi message trong body)
router.post("/chat", chatWithAI);

// ============== HOTEL INFO ==============
// Lấy danh sách tất cả khách sạn
router.get("/hotels", getAllHotels);

// Tìm kiếm khách sạn theo từ khóa
router.get("/hotels/search", searchHotels);

// Lấy thông tin đầy đủ của khách sạn (cho chatbot)
router.get("/hotels/:maKS/full-info", getHotelFullInfo);

// Lấy phòng còn trống của khách sạn
router.get("/hotels/:maKS/available-rooms", getHotelWithAvailableRooms);

// Lấy tiện nghi của khách sạn
router.get("/hotels/:maKS/amenities", getHotelAmenities);

// Lấy khuyến mãi còn hạn của khách sạn
router.get("/hotels/:maKS/promotions", getHotelActivePromotions);

// Kiểm tra phòng có còn trống không
router.get("/rooms/:maPhong/availability", checkRoomAvailability);

module.exports = router;
