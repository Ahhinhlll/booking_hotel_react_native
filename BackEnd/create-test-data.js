const { sequelize } = require('./config/config');
const KhachSan = require('./models/khachSanModel');
const Phong = require('./models/phongModel');
const GiaPhong = require('./models/giaPhongModel');
const LoaiPhong = require('./models/loaiPhongModel');

// Tạo dữ liệu test cho booking
async function createTestData() {
  try {
    console.log('🔄 Creating test data for booking...\n');
    
    // 1. Tạo khách sạn test
    console.log('1. Creating test hotel...');
    const testHotel = await KhachSan.create({
      tenKS: 'Test Hotel',
      diaChi: '123 Test Street, Test City',
      dienThoai: '0123456789',
      tinhThanh: 'Test Province',
      giaThapNhat: 500000,
      hangSao: 4,
      diemDanhGia: 8,
      trangThai: 'Hoạt động',
      noiBat: 'Nổi bật'
    });
    console.log('✅ Test hotel created:', testHotel.maKS);
    
    // 2. Tạo loại phòng test
    console.log('\n2. Creating test room type...');
    const testRoomType = await LoaiPhong.create({
      tenLoaiPhong: 'Test Room Type',
      moTa: 'Test room type description'
    });
    console.log('✅ Test room type created:', testRoomType.maLoaiPhong);
    
    // 3. Tạo phòng test
    console.log('\n3. Creating test room...');
    const testRoom = await Phong.create({
      maKS: testHotel.maKS,
      maLoaiPhong: testRoomType.maLoaiPhong,
      tenPhong: 'Test Room 101',
      dienTich: '25m²',
      moTa: ['Test room description'],
      trangThai: 'Trống',
      anh: ['test-room-image.jpg'],
      gia: 500000
    });
    console.log('✅ Test room created:', testRoom.maPhong);
    
    // 4. Tạo giá phòng test
    console.log('\n4. Creating test room pricing...');
    const testPricing = await GiaPhong.create({
      maPhong: testRoom.maPhong,
      loaiDat: 'Theo giờ',
      gia2GioDau: 200000,
      gia1GioThem: 100000,
      giaQuaDem: 400000,
      giaTheoNgay: 500000
    });
    console.log('✅ Test pricing created:', testPricing.maGiaPhong);
    
    console.log('\n🎉 Test data created successfully!');
    console.log('\nTest Data Summary:');
    console.log('- Hotel ID:', testHotel.maKS);
    console.log('- Room ID:', testRoom.maPhong);
    console.log('- Pricing ID:', testPricing.maGiaPhong);
    console.log('- Room Type ID:', testRoomType.maLoaiPhong);
    
    return {
      hotelId: testHotel.maKS,
      roomId: testRoom.maPhong,
      pricingId: testPricing.maGiaPhong,
      roomTypeId: testRoomType.maLoaiPhong
    };
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  }
}

// Test booking với dữ liệu thực
async function testRealBooking() {
  try {
    console.log('\n🧪 Testing real booking...\n');
    
    const testData = await createTestData();
    
    // Test booking với dữ liệu thực
    const axios = require('axios');
    const baseUrl = 'http://localhost:3000/api/bookings';
    
    console.log('\n5. Testing confirm booking with real data...');
    try {
      const bookingResponse = await axios.post(`${baseUrl}/confirm`, {
        roomId: testData.roomId,
        hotelId: testData.hotelId,
        checkInDateTime: new Date().toISOString(),
        checkOutDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        bookingType: 'hourly',
        duration: 2,
        paymentMethod: 'hotel',
        clientCalculatedTotalAmount: 200000,
        promotionId: null
      });
      console.log('✅ Real booking successful:', bookingResponse.data);
    } catch (error) {
      console.log('❌ Real booking error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testRealBooking()
    .then(() => {
      console.log('\n✅ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestData, testRealBooking };

