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
    loaiDat: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    gia2GioDau: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    gia1GioThem: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    giaTheoNgay: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    giaQuaDem: {
      type: DataTypes.DOUBLE,
      allowNull: false,
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
