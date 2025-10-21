const sequelize = require("../config/config");

async function updateDanhGiaConstraint() {
  try {
    console.log("Đang cập nhật foreign key constraint cho bảng DanhGia...");
    
    // Xóa foreign key constraint cũ
    await sequelize.query(`
      ALTER TABLE DanhGia 
      DROP FOREIGN KEY IF EXISTS DanhGia_ibfk_3
    `);
    
    // Thêm foreign key constraint mới với SET NULL
    await sequelize.query(`
      ALTER TABLE DanhGia 
      ADD CONSTRAINT DanhGia_maDatPhong_fkey 
      FOREIGN KEY (maDatPhong) 
      REFERENCES DatPhong(maDatPhong) 
      ON DELETE SET NULL 
      ON UPDATE CASCADE
    `);
    
    console.log("✅ Đã cập nhật thành công foreign key constraint!");
    console.log("Bây giờ khi xóa đơn đặt phòng, đánh giá sẽ không bị xóa và maDatPhong sẽ được set thành NULL");
    
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật constraint:", error.message);
  } finally {
    await sequelize.close();
  }
}

// Chạy migration
updateDanhGiaConstraint();
