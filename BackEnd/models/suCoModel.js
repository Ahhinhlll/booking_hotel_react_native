const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const SuCo = sequelize.define(
  "SuCo",
  {
    maSuCo: {
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
    maPhong: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Phong",
        key: "maPhong",
      },
    },
    moTa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    chiPhi: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    ngayBao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    trangThai: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: "SuCo",
    timestamps: false,
  }
);

SuCo.associate = (models) => {
  SuCo.belongsTo(models.DatPhong, {
    foreignKey: "maDatPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  SuCo.belongsTo(models.Phong, {
    foreignKey: "maPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = SuCo;
