const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const GiaPhong = sequelize.define(
  "GiaPhong",
  {
    maGiaPhong: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    maPhong: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Phong",
        key: "maPhong",
      },
    },
    loaiGia: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    soTien: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    ngayBatDau: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    ngayKetThuc: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    trangThai: {
      type: DataTypes.STRING(20),
      defaultValue: "Hoạt động",
    },
  },
  {
    tableName: "GiaPhong",
    timestamps: false,
  }
);

GiaPhong.associate = (models) => {
  GiaPhong.belongsTo(models.Phong, {
    foreignKey: "maPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  GiaPhong.hasMany(models.DatPhong, {
    foreignKey: "maGiaPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = GiaPhong;
