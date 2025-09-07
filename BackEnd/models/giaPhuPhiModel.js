const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const GiaPhuPhi = sequelize.define(
  "GiaPhuPhi",
  {
    maGiaPhuPhi: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    maLoaiPhuPhi: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "LoaiPhuPhi",
        key: "maLoaiPhuPhi",
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
    soTien: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  {
    tableName: "GiaPhuPhi",
    timestamps: false,
  }
);

GiaPhuPhi.associate = (models) => {
  GiaPhuPhi.belongsTo(models.LoaiPhuPhi, {
    foreignKey: "maLoaiPhuPhi",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "LoaiPhuPhi",
  });
  GiaPhuPhi.belongsTo(models.KhachSan, {
    foreignKey: "maKS",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "KhachSan",
  });
};

module.exports = GiaPhuPhi;
