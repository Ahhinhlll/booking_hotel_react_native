const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const PhuPhi = sequelize.define(
  "PhuPhi",
  {
    maPhuPhi: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    maDP: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "DatPhong",
        key: "maDatPhong",
      },
    },
    maLoaiPhuPhi: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "LoaiPhuPhi",
        key: "maLoaiPhuPhi",
      },
    },
    soTien: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    ngayPhatSinh: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    ghiChu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "PhuPhi",
    timestamps: false,
  }
);

PhuPhi.associate = (models) => {
  PhuPhi.belongsTo(models.DatPhong, {
    foreignKey: "maDP",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "DatPhong",
  });
  PhuPhi.belongsTo(models.LoaiPhuPhi, {
    foreignKey: "maLoaiPhuPhi",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "LoaiPhuPhi",
  });
};

module.exports = PhuPhi;
