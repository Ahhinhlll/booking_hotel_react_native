const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const TienNghi = sequelize.define(
  "TienNghi",
  {
    maTienNghi: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenTienNghi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trangThai: {
      type: DataTypes.STRING,
      defaultValue: "Hoạt động",
    },
  },
  {
    tableName: "TienNghi",
    timestamps: false,
  }
);

TienNghi.associate = (models) => {
  TienNghi.hasMany(models.TienNghiPhong, {
    foreignKey: "maTienNghi",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "TienNghiPhongs",
  });
};

module.exports = TienNghi;
