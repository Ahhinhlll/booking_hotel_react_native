const sequelize = require("../config/config");

async function removeDanhGiaForeignKeyConstraint() {
  try {
    console.log("Đang xóa foreign key constraint cho bảng DanhGia...");
    
    // Xóa foreign key constraint cũ
    await sequelize.query(`
      ALTER TABLE DanhGia 
      DROP FOREIGN KEY IF EXISTS DanhGia_maDatPhong_fkey
    `);
    
    console.log("✅ Đã xóa thành công foreign key constraint!");
    console.log("Bây giờ có thể insert đánh giá với maDatPhong không tồn tại trong bảng datphong");
    console.log("maDatPhong sẽ được lưu như một trường tham chiếu thông thường");
    
  } catch (error) {
    console.error("❌ Lỗi khi xóa constraint:", error.message);
  } finally {
    await sequelize.close();
  }
}

// Chạy migration
removeDanhGiaForeignKeyConstraint();
