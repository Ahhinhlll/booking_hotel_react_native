const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const VaiTro = sequelize.define(
  "VaiTro",
  {
    maVaiTro: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    tenVT: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    moTa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "VaiTro",
  }
);

VaiTro.associate = (models) => {
  VaiTro.hasMany(models.NguoiDung, {
    foreignKey: "maVaiTro",
    as: "NguoiDungs",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = VaiTro;
