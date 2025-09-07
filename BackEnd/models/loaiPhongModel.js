const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const LoaiPhong = sequelize.define(
  "LoaiPhong",
  {
    maLoaiPhong: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenLoaiPhong: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    moTa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trangThai: {
      type: DataTypes.STRING,
      defaultValue: "Hoạt động",
    },
  },
  {
    tableName: "LoaiPhong",
    timestamps: false,
  }
);

LoaiPhong.associate = (models) => {
  LoaiPhong.hasMany(models.Phong, {
    foreignKey: "maLoaiPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = LoaiPhong;
