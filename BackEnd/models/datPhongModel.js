const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const DatPhong = sequelize.define(
  "DatPhong",
  {
    maDatPhong: {
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
    maPhong: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Phong",
        key: "maPhong",
      },
    },
    loaiDat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ngayDat: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    ngayNhan: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ngayTra: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    soNguoiLon: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    soTreEm: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    soGio: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    soNgay: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tongTienGoc: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    tongTienSauGiam: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    maKM: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "KhuyenMai",
        key: "maKM",
      },
    },
    trangThai: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ghiChu: {
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
    maGiaPhong: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "GiaPhong",
        key: "maGiaPhong",
      },
    },
  },
  {
    tableName: "DatPhong",
    timestamps: false,
  }
);

DatPhong.associate = (models) => {
  DatPhong.belongsTo(models.NguoiDung, {
    foreignKey: "maND",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  DatPhong.belongsTo(models.KhachSan, {
    foreignKey: "maKS",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  DatPhong.belongsTo(models.Phong, {
    foreignKey: "maPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  DatPhong.belongsTo(models.KhuyenMai, {
    foreignKey: "maKM",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  DatPhong.belongsTo(models.GiaPhong, {
    foreignKey: "maGiaPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  DatPhong.hasMany(models.ThanhToan, {
    foreignKey: "maDatPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  DatPhong.hasMany(models.DanhGia, {
    foreignKey: "maDatPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  DatPhong.hasMany(models.SuCo, {
    foreignKey: "maDatPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
};

module.exports = DatPhong;
