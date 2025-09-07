const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const LoaiPhuPhi = sequelize.define(
  "LoaiPhuPhi",
  {
    maLoaiPhuPhi: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenLoai: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    moTa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    loaiApDung: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    donViTinh: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "LoaiPhuPhi",
    timestamps: false,
  }
);

LoaiPhuPhi.associate = (models) => {
  LoaiPhuPhi.hasMany(models.PhuPhi, {
    foreignKey: "maLoaiPhuPhi",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "PhuPhis",
  });
  LoaiPhuPhi.hasMany(models.GiaPhuPhi, {
    foreignKey: "maLoaiPhuPhi",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "GiaPhuPhis",
  });
};

module.exports = LoaiPhuPhi;
