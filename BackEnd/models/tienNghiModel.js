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
    maKS: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "KhachSan",
        key: "maKS",
      },
    },
    maPhong: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Phong",
        key: "maPhong",
      },
    },
  },
  {
    tableName: "TienNghi",
    timestamps: false,
  }
);

TienNghi.associate = (models) => {
  // Tiện nghi thuộc về 1 khách sạn
  TienNghi.belongsTo(models.KhachSan, {
    foreignKey: "maKS",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Tiện nghi thuộc về 1 phòng
  TienNghi.belongsTo(models.Phong, {
    foreignKey: "maPhong",
    as: "phong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = TienNghi;
