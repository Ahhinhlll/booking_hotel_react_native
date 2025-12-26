const db = require("../models");
const { Op } = require("sequelize");

/**
 * ChatBox Controller
 * Cung cấp API cho chatbot đọc thông tin từ database
 */

// Lấy danh sách tất cả khách sạn (tên và địa chỉ)
const getAllHotels = async (req, res) => {
  try {
    const hotels = await db.KhachSan.findAll({
      where: { trangThai: "Hoạt động" },
      attributes: [
        "maKS",
        "tenKS",
        "diaChi",
        "tinhThanh",
        "dienThoai",
        "hangSao",
        "giaThapNhat",
      ],
    });
    res.json({
      success: true,
      message: `Có ${hotels.length} khách sạn đang hoạt động`,
      data: hotels,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tìm kiếm khách sạn theo tên hoặc địa chỉ
const searchHotels = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập từ khóa tìm kiếm" });
    }

    const hotels = await db.KhachSan.findAll({
      where: {
        trangThai: "Hoạt động",
        [Op.or]: [
          { tenKS: { [Op.like]: `%${keyword}%` } },
          { diaChi: { [Op.like]: `%${keyword}%` } },
          { tinhThanh: { [Op.like]: `%${keyword}%` } },
        ],
      },
      attributes: [
        "maKS",
        "tenKS",
        "diaChi",
        "tinhThanh",
        "dienThoai",
        "hangSao",
        "giaThapNhat",
      ],
    });

    res.json({
      success: true,
      message:
        hotels.length > 0
          ? `Tìm thấy ${hotels.length} khách sạn phù hợp với "${keyword}"`
          : `Không tìm thấy khách sạn nào với từ khóa "${keyword}"`,
      data: hotels,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy thông tin chi tiết khách sạn kèm phòng còn trống
const getHotelWithAvailableRooms = async (req, res) => {
  try {
    const { maKS } = req.params;

    // Lấy thông tin khách sạn
    const hotel = await db.KhachSan.findByPk(maKS, {
      attributes: [
        "maKS",
        "tenKS",
        "diaChi",
        "tinhThanh",
        "dienThoai",
        "hangSao",
        "giaThapNhat",
        "diemDanhGia",
      ],
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khách sạn" });
    }

    // Lấy tất cả phòng của khách sạn
    const allRooms = await db.Phong.findAll({
      where: { maKS },
      include: [
        { model: db.LoaiPhong, attributes: ["tenLoaiPhong", "moTa"] },
        {
          model: db.GiaPhong,
          attributes: [
            "gia2GioDau",
            "gia1GioThem",
            "giaTheoNgay",
            "giaQuaDem",
            "loaiDat",
          ],
        },
      ],
      attributes: [
        "maPhong",
        "tenPhong",
        "soGiuong",
        "dienTich",
        "sucChua",
        "gia",
        "moTa",
      ],
    });

    // Lấy các đơn đặt phòng đang hoạt động (không phải Hoàn thành hoặc Đã hủy)
    const activeBookings = await db.DatPhong.findAll({
      where: {
        maKS,
        trangThai: { [Op.notIn]: ["Hoàn thành", "Đã hủy"] },
      },
      attributes: ["maPhong"],
    });

    const bookedRoomIds = activeBookings.map((b) => b.maPhong);

    // Phân loại phòng còn trống và đã đặt
    const availableRooms = allRooms.filter(
      (room) => !bookedRoomIds.includes(room.maPhong)
    );
    const bookedRooms = allRooms.filter((room) =>
      bookedRoomIds.includes(room.maPhong)
    );

    res.json({
      success: true,
      message: `Khách sạn ${hotel.tenKS} có ${availableRooms.length} phòng trống và ${bookedRooms.length} phòng đã đặt`,
      data: {
        hotel,
        totalRooms: allRooms.length,
        availableRooms: availableRooms.map((room) => ({
          maPhong: room.maPhong,
          tenPhong: room.tenPhong,
          loaiPhong: room.LoaiPhong?.tenLoaiPhong || "N/A",
          soGiuong: room.soGiuong,
          dienTich: room.dienTich,
          sucChua: room.sucChua,
          gia: room.gia,
          moTa: room.moTa,
          giaPhong: room.GiaPhongs,
        })),
        bookedRooms: bookedRooms.map((room) => ({
          maPhong: room.maPhong,
          tenPhong: room.tenPhong,
          loaiPhong: room.LoaiPhong?.tenLoaiPhong || "N/A",
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy tiện nghi của khách sạn
const getHotelAmenities = async (req, res) => {
  try {
    const { maKS } = req.params;

    const hotel = await db.KhachSan.findByPk(maKS, {
      attributes: ["maKS", "tenKS"],
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khách sạn" });
    }

    // Lấy tiện nghi chung (không gắn với phòng cụ thể)
    const hotelAmenities = await db.TienNghi.findAll({
      where: {
        [Op.or]: [
          { maKS, maPhong: null },
          { maKS: null, maPhong: null }, // Tiện nghi chung cho tất cả
        ],
      },
      attributes: ["maTienNghi", "tenTienNghi"],
    });

    res.json({
      success: true,
      message: `Khách sạn ${hotel.tenKS} có ${hotelAmenities.length} tiện nghi`,
      data: {
        hotel: hotel.tenKS,
        amenities: hotelAmenities.map((a) => a.tenTienNghi),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy khuyến mãi còn hạn của khách sạn
const getHotelActivePromotions = async (req, res) => {
  try {
    const { maKS } = req.params;
    const now = new Date();

    const hotel = await db.KhachSan.findByPk(maKS, {
      attributes: ["maKS", "tenKS"],
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khách sạn" });
    }

    const activePromotions = await db.KhuyenMai.findAll({
      where: {
        maKS,
        ngayBatDau: { [Op.lte]: now },
        ngayKetThuc: { [Op.gte]: now },
      },
      attributes: [
        "maKM",
        "tenKM",
        "thongTinKM",
        "phanTramGiam",
        "giaTriGiam",
        "ngayBatDau",
        "ngayKetThuc",
      ],
    });

    res.json({
      success: true,
      message:
        activePromotions.length > 0
          ? `Khách sạn ${hotel.tenKS} có ${activePromotions.length} khuyến mãi đang áp dụng`
          : `Khách sạn ${hotel.tenKS} hiện không có khuyến mãi nào`,
      data: {
        hotel: hotel.tenKS,
        promotions: activePromotions.map((p) => ({
          tenKM: p.tenKM,
          thongTin: p.thongTinKM,
          giamGia: p.phanTramGiam
            ? `${p.phanTramGiam}%`
            : p.giaTriGiam
            ? `${p.giaTriGiam.toLocaleString()} VNĐ`
            : "Không có",
          tuNgay: p.ngayBatDau,
          denNgay: p.ngayKetThuc,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Kiểm tra phòng cụ thể có còn trống không
const checkRoomAvailability = async (req, res) => {
  try {
    const { maPhong } = req.params;

    const room = await db.Phong.findByPk(maPhong, {
      include: [
        { model: db.KhachSan, attributes: ["tenKS"] },
        { model: db.LoaiPhong, attributes: ["tenLoaiPhong"] },
      ],
      attributes: [
        "maPhong",
        "tenPhong",
        "soGiuong",
        "dienTich",
        "sucChua",
        "gia",
      ],
    });

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phòng" });
    }

    // Kiểm tra có đơn đặt phòng đang hoạt động không
    const activeBooking = await db.DatPhong.findOne({
      where: {
        maPhong,
        trangThai: { [Op.notIn]: ["Hoàn thành", "Đã hủy"] },
      },
    });

    const isAvailable = !activeBooking;

    res.json({
      success: true,
      message: isAvailable
        ? `Phòng ${room.tenPhong} tại ${room.KhachSan?.tenKS} hiện đang TRỐNG và có thể đặt`
        : `Phòng ${room.tenPhong} tại ${room.KhachSan?.tenKS} hiện ĐÃ ĐƯỢC ĐẶT`,
      data: {
        room: {
          maPhong: room.maPhong,
          tenPhong: room.tenPhong,
          khachSan: room.KhachSan?.tenKS,
          loaiPhong: room.LoaiPhong?.tenLoaiPhong,
          soGiuong: room.soGiuong,
          dienTich: room.dienTich,
          sucChua: room.sucChua,
          gia: room.gia,
        },
        isAvailable,
        status: isAvailable ? "Trống" : "Đã đặt",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tổng hợp thông tin cho chatbot - trả lời câu hỏi về khách sạn
const getHotelFullInfo = async (req, res) => {
  try {
    const { maKS } = req.params;
    const now = new Date();

    // Lấy thông tin khách sạn
    const hotel = await db.KhachSan.findByPk(maKS, {
      attributes: [
        "maKS",
        "tenKS",
        "diaChi",
        "tinhThanh",
        "dienThoai",
        "hangSao",
        "giaThapNhat",
        "diemDanhGia",
      ],
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khách sạn" });
    }

    // Lấy phòng
    const allRooms = await db.Phong.findAll({
      where: { maKS },
      include: [{ model: db.LoaiPhong, attributes: ["tenLoaiPhong"] }],
      attributes: [
        "maPhong",
        "tenPhong",
        "soGiuong",
        "dienTich",
        "sucChua",
        "gia",
      ],
    });

    // Lấy đơn đặt phòng hoạt động
    const activeBookings = await db.DatPhong.findAll({
      where: {
        maKS,
        trangThai: { [Op.notIn]: ["Hoàn thành", "Đã hủy"] },
      },
      attributes: ["maPhong"],
    });
    const bookedRoomIds = activeBookings.map((b) => b.maPhong);

    // Lấy tiện nghi
    const amenities = await db.TienNghi.findAll({
      where: {
        [Op.or]: [
          { maKS, maPhong: null },
          { maKS: null, maPhong: null },
        ],
      },
      attributes: ["tenTienNghi"],
    });

    // Lấy khuyến mãi còn hạn
    const activePromotions = await db.KhuyenMai.findAll({
      where: {
        maKS,
        ngayBatDau: { [Op.lte]: now },
        ngayKetThuc: { [Op.gte]: now },
      },
      attributes: ["tenKM", "phanTramGiam", "giaTriGiam"],
    });

    // Lấy đánh giá trung bình
    const reviews = await db.DanhGia.findAll({
      where: { maKS },
      attributes: ["soSao"],
    });
    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.soSao, 0) / reviews.length
          ).toFixed(1)
        : "Chưa có";

    const availableRooms = allRooms.filter(
      (r) => !bookedRoomIds.includes(r.maPhong)
    );
    const bookedRooms = allRooms.filter((r) =>
      bookedRoomIds.includes(r.maPhong)
    );

    // Tạo câu trả lời cho chatbot
    let response = `🏨 **${hotel.tenKS}**\n`;
    response += `📍 Địa chỉ: ${hotel.diaChi}, ${hotel.tinhThanh}\n`;
    response += `📞 Điện thoại: ${hotel.dienThoai}\n`;
    response += `⭐ Đánh giá: ${avgRating}/5 (${reviews.length} đánh giá)\n`;
    response += `💰 Giá từ: ${
      hotel.giaThapNhat?.toLocaleString() || "Liên hệ"
    } VNĐ\n\n`;

    response += `🛏️ **Phòng:** ${availableRooms.length} trống / ${allRooms.length} tổng\n`;
    if (availableRooms.length > 0) {
      response += `Phòng trống:\n`;
      availableRooms.forEach((r) => {
        response += `  • ${r.tenPhong} (${r.LoaiPhong?.tenLoaiPhong}) - ${
          r.gia?.toLocaleString() || "Liên hệ"
        } VNĐ\n`;
      });
    }

    if (amenities.length > 0) {
      response += `\n🎁 **Tiện nghi:** ${amenities
        .map((a) => a.tenTienNghi)
        .join(", ")}\n`;
    }

    if (activePromotions.length > 0) {
      response += `\n🔥 **Khuyến mãi đang áp dụng:**\n`;
      activePromotions.forEach((p) => {
        const discount = p.phanTramGiam
          ? `${p.phanTramGiam}%`
          : `${p.giaTriGiam?.toLocaleString()} VNĐ`;
        response += `  • ${p.tenKM} - Giảm ${discount}\n`;
      });
    }

    res.json({
      success: true,
      message: response,
      data: {
        hotel,
        rooms: {
          total: allRooms.length,
          available: availableRooms.length,
          booked: bookedRooms.length,
          availableList: availableRooms,
          bookedList: bookedRooms,
        },
        amenities: amenities.map((a) => a.tenTienNghi),
        promotions: activePromotions,
        rating: { average: avgRating, count: reviews.length },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============== AI CHATBOT INTEGRATION ==============

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Hàm lấy tất cả dữ liệu từ database để cung cấp context cho AI
const getDatabaseContext = async () => {
  const now = new Date();

  // Lấy danh sách khách sạn
  const hotels = await db.KhachSan.findAll({
    where: { trangThai: "Hoạt động" },
    include: [
      { model: db.Phong, include: [{ model: db.LoaiPhong }] },
      { model: db.KhuyenMai },
    ],
  });

  // Lấy tất cả đơn đặt phòng đang hoạt động
  const activeBookings = await db.DatPhong.findAll({
    where: { trangThai: { [Op.notIn]: ["Hoàn thành", "Đã hủy"] } },
    attributes: ["maPhong", "maKS"],
  });
  const bookedRoomIds = activeBookings.map((b) => b.maPhong);

  // Lấy tiện nghi
  const amenities = await db.TienNghi.findAll();

  // Tạo context text
  let context = "=== THÔNG TIN HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN ===\n\n";

  hotels.forEach((hotel) => {
    const hotelRooms = hotel.Phongs || [];
    const availableRooms = hotelRooms.filter(
      (r) => !bookedRoomIds.includes(r.maPhong)
    );
    const bookedRooms = hotelRooms.filter((r) =>
      bookedRoomIds.includes(r.maPhong)
    );

    // Khuyến mãi còn hạn
    const activePromos = (hotel.KhuyenMais || []).filter(
      (p) => new Date(p.ngayBatDau) <= now && new Date(p.ngayKetThuc) >= now
    );

    context += `🏨 KHÁCH SẠN: ${hotel.tenKS}\n`;
    context += `   - Mã: ${hotel.maKS}\n`;
    context += `   - Địa chỉ: ${hotel.diaChi}, ${hotel.tinhThanh}\n`;
    context += `   - Điện thoại: ${hotel.dienThoai}\n`;
    context += `   - Hạng sao: ${hotel.hangSao || "Chưa có"}\n`;
    context += `   - Giá thấp nhất: ${
      hotel.giaThapNhat?.toLocaleString() || "Liên hệ"
    } VNĐ\n`;
    context += `   - Tổng số phòng: ${hotelRooms.length}\n`;
    context += `   - Phòng trống: ${availableRooms.length}\n`;
    context += `   - Phòng đã đặt: ${bookedRooms.length}\n`;

    if (availableRooms.length > 0) {
      context += `   - Danh sách phòng trống:\n`;
      availableRooms.forEach((r) => {
        context += `     + ${r.tenPhong} (${
          r.LoaiPhong?.tenLoaiPhong || "N/A"
        }) - ${r.gia?.toLocaleString() || "Liên hệ"} VNĐ - ${
          r.sucChua
        } người - ${r.dienTich}m²\n`;
      });
    }

    if (activePromos.length > 0) {
      context += `   - Khuyến mãi đang có:\n`;
      activePromos.forEach((p) => {
        const discount = p.phanTramGiam
          ? `${p.phanTramGiam}%`
          : `${p.giaTriGiam?.toLocaleString()} VNĐ`;
        context += `     + ${p.tenKM}: Giảm ${discount} (đến ${new Date(
          p.ngayKetThuc
        ).toLocaleDateString("vi-VN")})\n`;
      });
    }

    // Tiện nghi của khách sạn
    const hotelAmenities = amenities.filter(
      (a) => (a.maKS === hotel.maKS && !a.maPhong) || (!a.maKS && !a.maPhong)
    );
    if (hotelAmenities.length > 0) {
      context += `   - Tiện nghi: ${hotelAmenities
        .map((a) => a.tenTienNghi)
        .join(", ")}\n`;
    }

    context += "\n";
  });

  return context;
};

// API Chat với AI
const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập tin nhắn" });
    }

    // Kiểm tra API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Chưa cấu hình GEMINI_API_KEY trong file .env",
      });
    }

    const now = new Date();

    // Phân tích câu hỏi để tìm khách sạn được đề cập
    const messageLower = message.toLowerCase();
    let matchedHotel = null;
    let hotelData = null;

    // Lấy danh sách khách sạn
    const hotels = await db.KhachSan.findAll({
      where: { trangThai: "Hoạt động" },
      include: [
        { model: db.Phong, include: [{ model: db.LoaiPhong }] },
        { model: db.KhuyenMai },
      ],
    });

    // Tìm khách sạn được đề cập trong câu hỏi
    for (const hotel of hotels) {
      if (messageLower.includes(hotel.tenKS.toLowerCase())) {
        matchedHotel = hotel;
        break;
      }
    }

    // Nếu tìm thấy khách sạn, lấy thông tin chi tiết
    if (matchedHotel) {
      const activeBookings = await db.DatPhong.findAll({
        where: {
          maKS: matchedHotel.maKS,
          trangThai: { [Op.notIn]: ["Hoàn thành", "Đã hủy"] },
        },
        attributes: ["maPhong"],
      });
      const bookedRoomIds = activeBookings.map((b) => b.maPhong);

      const allRooms = matchedHotel.Phongs || [];
      const availableRooms = allRooms.filter(
        (r) => !bookedRoomIds.includes(r.maPhong)
      );
      const bookedRooms = allRooms.filter((r) =>
        bookedRoomIds.includes(r.maPhong)
      );

      // Khuyến mãi còn hạn
      const activePromos = (matchedHotel.KhuyenMais || []).filter(
        (p) => new Date(p.ngayBatDau) <= now && new Date(p.ngayKetThuc) >= now
      );

      hotelData = {
        hotel: {
          maKS: matchedHotel.maKS,
          tenKS: matchedHotel.tenKS,
          diaChi: matchedHotel.diaChi,
          tinhThanh: matchedHotel.tinhThanh,
          dienThoai: matchedHotel.dienThoai,
          hangSao: matchedHotel.hangSao,
          giaThapNhat: matchedHotel.giaThapNhat,
          anh: matchedHotel.anh,
        },
        rooms: {
          total: allRooms.length,
          available: availableRooms.length,
          booked: bookedRooms.length,
          availableList: availableRooms.map((r) => ({
            maPhong: r.maPhong,
            tenPhong: r.tenPhong,
            loaiPhong: r.LoaiPhong?.tenLoaiPhong,
            gia: r.gia,
            sucChua: r.sucChua,
            dienTich: r.dienTich,
            anh: r.anh,
          })),
          bookedList: bookedRooms.map((r) => ({
            maPhong: r.maPhong,
            tenPhong: r.tenPhong,
            loaiPhong: r.LoaiPhong?.tenLoaiPhong,
          })),
        },
        promotions: activePromos.map((p) => ({
          tenKM: p.tenKM,
          phanTramGiam: p.phanTramGiam,
          giaTriGiam: p.giaTriGiam,
        })),
      };
    }

    // Khởi tạo Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemma-3n-e4b-it" });

    // Lấy context từ database
    const databaseContext = await getDatabaseContext();

    // Tạo prompt cho AI
    const systemPrompt = `Bạn là trợ lý ảo của hệ thống đặt phòng khách sạn. Nhiệm vụ của bạn là:
1. Trả lời các câu hỏi về khách sạn, phòng, giá, tiện nghi, khuyến mãi
2. Giúp khách hàng tìm phòng phù hợp
3. Cung cấp thông tin chính xác từ dữ liệu hệ thống
4. Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
5. Nếu không tìm thấy thông tin, hãy nói rõ và gợi ý liên hệ hotline

Dưới đây là dữ liệu thực từ hệ thống:

${databaseContext}

---
Hãy trả lời câu hỏi của khách hàng dựa trên dữ liệu trên. Nếu khách hỏi về khách sạn cụ thể, hãy tìm trong danh sách và trả lời chính xác.`;

    const prompt = `${systemPrompt}\n\nCâu hỏi của khách hàng: ${message}`;

    // Gọi API Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    res.json({
      success: true,
      message: aiResponse,
      data: {
        userMessage: message,
        aiResponse: aiResponse,
        timestamp: new Date().toISOString(),
        // Thêm thông tin khách sạn/phòng nếu có
        ...(hotelData && { ...hotelData }),
      },
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xử lý tin nhắn: " + error.message,
    });
  }
};

module.exports = {
  getAllHotels,
  searchHotels,
  getHotelWithAvailableRooms,
  getHotelAmenities,
  getHotelActivePromotions,
  checkRoomAvailability,
  getHotelFullInfo,
  chatWithAI,
};
