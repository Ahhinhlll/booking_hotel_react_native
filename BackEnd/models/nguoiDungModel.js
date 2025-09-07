const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");
const md5 = require("md5");

const NguoiDung = sequelize.define(
  "NguoiDung",
  {
    maNguoiDung: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hoTen: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    matKhau: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        if (this.isNewRecord) {
          this.setDataValue("matKhau", md5(value));
        } else {
          this.setDataValue("matKhau", value);
        }
      },
    },
    sdt: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: true,
      },
    },
    diaChi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    anhNguoiDung: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        return JSON.parse(this.getDataValue("anhNguoiDung") || "[]");
      },
      set(value) {
        this.setDataValue("anhNguoiDung", JSON.stringify([].concat(value)));
      },
    },
    maVaiTro: {
      type: DataTypes.STRING,
      defaultValue: "U00",
      references: {
        model: "VaiTro",
        key: "maVaiTro",
      },
      allowNull: false,
    },
    ngayTao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    trangThai: {
      type: DataTypes.STRING,
      defaultValue: "Hoạt động",
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "NguoiDung",
  }
);

NguoiDung.associate = (models) => {
  NguoiDung.belongsTo(models.VaiTro, {
    foreignKey: "maVaiTro",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = NguoiDung;
