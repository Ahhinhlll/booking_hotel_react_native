const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const TienNghiChiTiet = sequelize.define(
  "TienNghiChiTiet",
  {
    maTNChiTiet: {
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
    maKS: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "KhachSan",
        key: "maKS",
      },
    },
    maTienNghi: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "TienNghi",
        key: "maTienNghi",
      },
    },
  },
  {
    tableName: "TienNghiPhong",
    timestamps: false,
  }
);

TienNghiChiTiet.associate = (models) => {
  TienNghiChiTiet.belongsTo(models.KhachSan, {
    foreignKey: "maKS",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  TienNghiChiTiet.belongsTo(models.Phong, {
    foreignKey: "maPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  TienNghiChiTiet.belongsTo(models.TienNghi, {
    foreignKey: "maTienNghi",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = TienNghiChiTiet;
