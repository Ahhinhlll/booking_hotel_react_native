const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const DanhGia = sequelize.define(
  "DanhGia",
  {
    maDG: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    maND: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "NguoiDung",
        key: "maNguoiDung",
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
    maDatPhong: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "DatPhong",
        key: "maDatPhong",
      },
    },
    soSao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    binhLuan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ngayDG: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "DanhGia",
    timestamps: false,
  }
);

DanhGia.associate = (models) => {
  DanhGia.belongsTo(models.NguoiDung, {
    foreignKey: "maND",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  DanhGia.belongsTo(models.KhachSan, {
    foreignKey: "maKS",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  DanhGia.belongsTo(models.DatPhong, {
    foreignKey: "maDatPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = DanhGia;
