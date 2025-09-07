const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const KhuyenMai = sequelize.define(
  "KhuyenMai",
  {
    maKM: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenKM: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thongTin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    giaTriGiam: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    ngayBatDau: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ngayKetThuc: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    anh: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        return this.getDataValue("anh") || null;
      },
      set(value) {
        this.setDataValue("anh", value);
      },
    },
    trangThai: {
      type: DataTypes.STRING,
      defaultValue: "Hoạt động",
    },
    loaiKM: {
      type: DataTypes.STRING,
      defaultValue: "Percent",
    },
  },
  {
    tableName: "KhuyenMai",
    timestamps: false,
  }
);

KhuyenMai.associate = (models) => {
  KhuyenMai.hasMany(models.DatPhong, {
    foreignKey: "maKM",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "DatPhongs",
  });
};

module.exports = KhuyenMai;
