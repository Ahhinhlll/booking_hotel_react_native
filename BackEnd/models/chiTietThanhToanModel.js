const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const ChiTietThanhToan = sequelize.define(
  "ChiTietThanhToan",
  {
    maCTTT: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    maTT: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "ThanhToan",
        key: "maTT",
      },
    },
    loaiKhoan: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    soTien: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
  },
  {
    tableName: "ChiTietThanhToan",
    timestamps: false,
  }
);

ChiTietThanhToan.associate = (models) => {
  ChiTietThanhToan.belongsTo(models.ThanhToan, {
    foreignKey: "maTT",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "ThanhToan",
  });
};

module.exports = ChiTietThanhToan;
