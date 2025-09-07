const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const TienNghiPhong = sequelize.define(
  "TienNghiPhong",
  {
    maTNKS: {
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

TienNghiPhong.associate = (models) => {
  TienNghiPhong.belongsTo(models.Phong, {
    foreignKey: "maPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "Phong",
  });
  TienNghiPhong.belongsTo(models.KhachSan, {
    foreignKey: "maKS",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "KhachSan",
  });
  TienNghiPhong.belongsTo(models.TienNghi, {
    foreignKey: "maTienNghi",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "TienNghi",
  });
};

module.exports = TienNghiPhong;
