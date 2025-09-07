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
    maGiaPhong: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "GiaPhong",
        key: "maGiaPhong",
      },
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
    maTTDP: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "TrangThaiDatPhong",
        key: "maTTDP",
      },
    },
    tongTien: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    hinhThuc: {
      type: DataTypes.STRING,
      defaultValue: "Online",
    },
    ghiChu: {
      type: DataTypes.STRING,
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
    kieuDat: {
      type: DataTypes.STRING,
      defaultValue: "TheoNgay",
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
    as: "NguoiDung",
  });
  DatPhong.belongsTo(models.Phong, {
    foreignKey: "maPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "Phong",
  });
  DatPhong.belongsTo(models.GiaPhong, {
    foreignKey: "maGiaPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "GiaPhong",
  });
  DatPhong.belongsTo(models.TrangThaiDatPhong, {
    foreignKey: "maTTDP",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "TrangThaiDatPhong",
  });
  DatPhong.belongsTo(models.KhuyenMai, {
    foreignKey: "maKM",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "KhuyenMai",
  });
  DatPhong.hasMany(models.GioDatPhong, {
    foreignKey: "maDatPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "GioDatPhongs",
  });
  DatPhong.hasMany(models.PhuPhi, {
    foreignKey: "maDP",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "PhuPhis",
  });
  DatPhong.hasMany(models.ThanhToan, {
    foreignKey: "maDatPhong",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "ThanhToans",
  });
};

module.exports = DatPhong;
