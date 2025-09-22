const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const ThanhToan = sequelize.define(
  "ThanhToan",
  {
    maTT: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    maDatPhong: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "DatPhong",
        key: "maDatPhong",
      },
    },
    phuongThuc: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    soTien: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    trangThai: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ngayTT: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    maGiaoDich: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "ThanhToan",
    timestamps: false,
  }
);

ThanhToan.associate = (models) => {
  ThanhToan.belongsTo(models.DatPhong, {
    foreignKey: "maDatPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = ThanhToan;
