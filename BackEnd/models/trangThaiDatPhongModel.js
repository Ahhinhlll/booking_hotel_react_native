const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const TrangThaiDatPhong = sequelize.define(
  "TrangThaiDatPhong",
  {
    maTTDP: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenTrangThai: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "TrangThaiDatPhong",
    timestamps: false,
  }
);

TrangThaiDatPhong.associate = (models) => {
  TrangThaiDatPhong.hasMany(models.DatPhong, {
    foreignKey: "maTTDP",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "DatPhongs",
  });
};

module.exports = TrangThaiDatPhong;
