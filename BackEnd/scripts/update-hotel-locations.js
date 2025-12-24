const KhachSan = require("../models/khachSanModel");
const sequelize = require("../config/config");

// Dữ liệu mẫu tọa độ một số khách sạn tại TP.HCM
const sampleLocations = [
  { latitude: 10.7769, longitude: 106.7009 }, // Gần Bến Thành
  { latitude: 10.7797, longitude: 106.6990 }, // Quận 1
  { latitude: 10.8184, longitude: 106.6595 }, // Gần sân bay
  { latitude: 10.7625, longitude: 106.6822 }, // Quận 3
  { latitude: 10.7883, longitude: 106.7019 }, // Quận 1 - Đông Du
  { latitude: 10.7729, longitude: 106.6988 }, // Lê Lợi
  { latitude: 10.7756, longitude: 106.7004 }, // Nguyễn Huệ
  { latitude: 10.7812, longitude: 106.6956 }, // Đồng Khởi
  { latitude: 10.7698, longitude: 106.6917 }, // Phạm Ngũ Lão
  { latitude: 10.7652, longitude: 106.6823 }, // Võ Văn Tần
];

async function updateHotelLocations() {
  try {
    console.log("Fetching all hotels...");
    const hotels = await KhachSan.findAll();

    if (hotels.length === 0) {
      console.log("No hotels found in database.");
      return;
    }

    console.log(`Found ${hotels.length} hotels. Updating locations...`);

    let updated = 0;
    for (let i = 0; i < hotels.length; i++) {
      const hotel = hotels[i];
      
      // Chỉ cập nhật nếu chưa có tọa độ
      if (!hotel.latitude || !hotel.longitude) {
        // Lấy tọa độ mẫu theo index (lặp lại nếu hết)
        const location = sampleLocations[i % sampleLocations.length];
        
        // Thêm một chút random để các khách sạn không trùng vị trí
        const randomOffset = () => (Math.random() - 0.5) * 0.01; // ~1km offset
        
        await hotel.update({
          latitude: location.latitude + randomOffset(),
          longitude: location.longitude + randomOffset(),
        });

        console.log(`✓ Updated ${hotel.tenKS}: (${hotel.latitude}, ${hotel.longitude})`);
        updated++;
      } else {
        console.log(`- Skipped ${hotel.tenKS}: Already has coordinates`);
      }
    }

    console.log(`\n✅ Successfully updated ${updated} hotels!`);
    console.log(`ℹ️  ${hotels.length - updated} hotels already had coordinates.`);
  } catch (error) {
    console.error("❌ Error updating hotel locations:", error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
updateHotelLocations();
