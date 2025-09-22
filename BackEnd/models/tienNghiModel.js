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
    icon: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        return JSON.parse(this.getDataValue("icon") || "[]");
      },
      set(value) {
        this.setDataValue("icon", JSON.stringify([].concat(value)));
      },
    },
    loai: {
      type: DataTypes.STRING, // khách sạn or phòng
      allowNull: true,
    },
  },
  {
    tableName: "TienNghi",
    timestamps: false,
  }
);

TienNghi.associate = (models) => {
  TienNghi.hasMany(models.TienNghiChiTiet, {
    foreignKey: "maTienNghi",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = TienNghi;
