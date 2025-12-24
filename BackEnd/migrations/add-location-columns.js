const { Sequelize } = require("sequelize");
const sequelize = require("../config/config");

async function addLocationColumns() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log("Adding latitude and longitude columns to KhachSan table...");

    // Check if columns already exist
    const tableDescription = await queryInterface.describeTable("KhachSan");

    if (!tableDescription.latitude) {
      await queryInterface.addColumn("KhachSan", "latitude", {
        type: Sequelize.DOUBLE,
        allowNull: true,
      });
      console.log("✓ Added latitude column");
    } else {
      console.log("✓ latitude column already exists");
    }

    if (!tableDescription.longitude) {
      await queryInterface.addColumn("KhachSan", "longitude", {
        type: Sequelize.DOUBLE,
        allowNull: true,
      });
      console.log("✓ Added longitude column");
    } else {
      console.log("✓ longitude column already exists");
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration
addLocationColumns();
