const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Phong = sequelize.define(
  "Phong",
  {
    maPhong: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    maKS: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "KhachSan",
        key: "maKS",
      },
    },
    maLoaiPhong: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "LoaiPhong",
        key: "maLoaiPhong",
      },
    },
    tenPhong: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dienTich: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    moTa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trangThai: {
      type: DataTypes.STRING,
      defaultValue: "Trống",
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
    gia: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "Phong",
    timestamps: false,
  }
);

Phong.associate = (models) => {
  Phong.belongsTo(models.KhachSan, {
    foreignKey: "maKS",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Phong.belongsTo(models.LoaiPhong, {
    foreignKey: "maLoaiPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Phong.hasMany(models.GiaPhong, {
    foreignKey: "maPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Phong.hasMany(models.KhuyenMai, {
    foreignKey: "maPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Phong.hasMany(models.DatPhong, {
    foreignKey: "maPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Phong.hasMany(models.TienNghiChiTiet, {
    foreignKey: "maPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Phong.hasMany(models.SuCo, {
    foreignKey: "maPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = Phong;
