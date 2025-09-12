const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const KhachSan = sequelize.define(
  "KhachSan",
  {
    maKS: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenKS: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    diaChi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dienThoai: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isNumeric: true,
      },
    },
    tinhThanh: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    giaChiTu: {
      type: DataTypes.DOUBLE,
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

    trangThai: {
      type: DataTypes.STRING(20),
      defaultValue: "Hoạt động",
    },
    hangSao: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
    loaiHinh: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: "KhachSan",
  }
);

KhachSan.associate = (models) => {
  KhachSan.hasMany(models.Phong, {
    foreignKey: "maKS",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  KhachSan.hasMany(models.TienNghiPhong, {
    foreignKey: "maKS",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  KhachSan.hasMany(models.GiaPhuPhi, {
    foreignKey: "maKS",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  KhachSan.hasMany(models.DanhGia, {
    foreignKey: "maKS",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = KhachSan;
