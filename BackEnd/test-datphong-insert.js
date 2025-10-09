// Test script để kiểm tra API datphong/insert
const fetch = require('node-fetch');

async function testDatPhongInsert() {
  try {
    // Test data
    const testData = {
      maND: "test-user-id", // Sẽ cần thay bằng user ID thật
      maPhong: "test-room-id", // Sẽ cần thay bằng room ID thật
      maGiaPhong: "test-price-id", // Sẽ cần thay bằng price ID thật
      loaiDat: "Theo giờ",
      ngayNhan: new Date().toISOString(),
      ngayTra: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      soNguoiLon: 1,
      soTreEm: 0,
      soGio: 2,
      ghiChu: "Test booking",
      maKS: "test-hotel-id",
      phuongThucThanhToan: "hotel"
    };

    console.log('Testing with data:', testData);

    const response = await fetch('http://localhost:3333/api/datphong/insert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response data:', result);

  } catch (error) {
    console.error('Test error:', error);
  }
}

// Chạy test
testDatPhongInsert();
