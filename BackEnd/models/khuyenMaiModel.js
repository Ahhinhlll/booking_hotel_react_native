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
    phanTramGiam: {
      type: DataTypes.DOUBLE,
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
        return JSON.parse(this.getDataValue("anh") || "[]");
      },
      set(value) {
        this.setDataValue("anh", JSON.stringify([].concat(value)));
      },
    },
    maKS: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "KhachSan",
        key: "maKS",
      },
    },
    maPhong: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Phong",
        key: "maPhong",
      },
    },
    trangThai: {
      type: DataTypes.STRING,
      defaultValue: "Hoạt động",
    },
  },
  {
    tableName: "KhuyenMai",
    timestamps: false,
  }
);

KhuyenMai.associate = (models) => {
  KhuyenMai.belongsTo(models.KhachSan, {
    foreignKey: "maKS",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  KhuyenMai.belongsTo(models.Phong, {
    foreignKey: "maPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  KhuyenMai.hasMany(models.DatPhong, {
    foreignKey: "maKM",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = KhuyenMai;
