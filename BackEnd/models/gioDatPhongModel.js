const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const GioDatPhong = sequelize.define(
  "GioDatPhong",
  {
    maGDP: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    maDatPhong: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "DatPhong",
        key: "maDatPhong",
      },
    },
    gioNhan: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    gioTra: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    soGio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "GioDatPhong",
    timestamps: false,
  }
);

GioDatPhong.associate = (models) => {
  GioDatPhong.belongsTo(models.DatPhong, {
    foreignKey: "maDatPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "DatPhong",
  });
};

module.exports = GioDatPhong;
