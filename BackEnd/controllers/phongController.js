const Phong = require("../models/phongModel");
const db = require("../models");
const { Op } = require("sequelize");

// Lấy danh sách phòng theo mã khách sạn
exports.getByKhachSan = async (req, res) => {
  try {
    const { maKS } = req.params;
    if (!maKS) {
      return res.status(400).json({ message: "Thiếu mã khách sạn" });
    }
    const items = await Phong.findAll({
      where: { maKS },
      include: [
        { model: db.KhachSan },
        { model: db.LoaiPhong },
        { model: db.GiaPhong },
        { model: db.KhuyenMai },
        { model: db.DatPhong },
        { model: db.TienNghiChiTiet },
        { model: db.SuCo },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getAll = async (req, res) => {
  try {
    const items = await Phong.findAll({
      include: [
        { model: db.KhachSan },
        { model: db.LoaiPhong },
        { model: db.GiaPhong },
        { model: db.KhuyenMai },
        { model: db.DatPhong },
        { model: db.TienNghiChiTiet },
        { model: db.SuCo },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Phong.findByPk(req.params.id, {
      include: [
        { model: db.KhachSan },
        { model: db.LoaiPhong },
        { model: db.GiaPhong },
        { model: db.KhuyenMai },
        { model: db.DatPhong },
        { model: db.TienNghiChiTiet },
        { model: db.SuCo },
      ],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { maKS, maLoaiPhong } = req.body;
    if (!maKS || !maLoaiPhong) {
      return res
        .status(400)
        .json({ message: "Thiếu mã khách sạn hoặc mã loại phòng" });
    }
    // Kiểm tra KhachSan tồn tại
    const khachSan = await db.KhachSan.findByPk(maKS);
    if (!khachSan) {
      return res.status(400).json({ message: "Khách sạn không tồn tại" });
    }
    // Kiểm tra LoaiPhong tồn tại
    const loaiPhong = await db.LoaiPhong.findByPk(maLoaiPhong);
    if (!loaiPhong) {
      return res.status(400).json({ message: "Loại phòng không tồn tại" });
    }
    // Đảm bảo giá phòng là 0 khi tạo mới
    const requestBody = {
      ...req.body,
      gia: 0,
    };

    const newItem = await Phong.create(requestBody);

    // Cập nhật giá phòng dựa trên giá phòng (nếu có)
    await updateGiaPhongForPhong(newItem.maPhong);

    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Phong.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);

      // Sau khi cập nhật phòng, cập nhật lại giá thấp nhất cho khách sạn
      await updateGiaThapNhat(item.maKS);

      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const phong = await Phong.findByPk(req.params.id);
    if (!phong) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    const maKS = phong.maKS;
    const deleted = await Phong.destroy({ where: { maPhong: req.params.id } });

    if (deleted) {
      // Sau khi xóa phòng, cập nhật lại giá thấp nhất cho khách sạn
      await updateGiaThapNhat(maKS);
      res.status(200).json({ message: "Xóa thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy phòng" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Hàm cập nhật giá thấp nhất cho khách sạn dựa trên các phòng trong khách sạn đó
const updateGiaThapNhat = async (maKS) => {
  try {
    // Lấy tất cả các phòng của khách sạn có trạng thái hoạt động
    const phongs = await db.Phong.findAll({
      where: {
        maKS: maKS,
      },
      attributes: ["gia"], // Chỉ lấy trường giá
    });

    if (phongs.length === 0) {
      // Nếu không có phòng nào, đặt giá thấp nhất là 0
      await db.KhachSan.update({ giaThapNhat: 0 }, { where: { maKS: maKS } });
      return;
    }

    // Lọc các phòng có giá > 0 và tìm giá thấp nhất
    const giaPhongs = phongs
      .filter((phong) => phong.gia !== null && phong.gia > 0)
      .map((phong) => phong.gia);

    if (giaPhongs.length === 0) {
      // Nếu không có phòng nào có giá > 0, đặt giá thấp nhất là 0
      await db.KhachSan.update({ giaThapNhat: 0 }, { where: { maKS: maKS } });
      return;
    }

    // Tìm giá thấp nhất từ các phòng có giá > 0
    const giaThapNhat = Math.min(...giaPhongs);

    // Cập nhật giá thấp nhất cho khách sạn
    await db.KhachSan.update(
      { giaThapNhat: giaThapNhat },
      { where: { maKS: maKS } }
    );
  } catch (error) {
    console.error("Lỗi khi cập nhật giá thấp nhất cho khách sạn:", error);
    throw error; // Ném lại lỗi để xử lý ở nơi gọi hàm nếu cần
  }
};

// Hàm cập nhật giá phòng dựa trên giá phòng (lấy theo gia2GioDau)
const updateGiaPhongForPhong = async (maPhong) => {
  try {
    // Lấy tất cả các giá phòng cho phòng cụ thể
    const giaPhongs = await db.GiaPhong.findAll({
      where: {
        maPhong: maPhong,
        trangThai: "Hoạt động",
      },
      attributes: ["gia2GioDau", "gia1GioThem", "giaTheoNgay", "giaQuaDem"],
    });

    if (giaPhongs.length === 0) {
      // Nếu không có giá phòng nào, giữ nguyên giá phòng là 0
      // Không cập nhật lại giá thấp nhất cho khách sạn trong trường hợp này
      return;
    }

    // Lấy giá theo 2 giờ đầu tiên (gia2GioDau) từ bản ghi đầu tiên
    // Nếu không có giá 2 giờ đầu, có thể sử dụng giá theo ngày như giá mặc định
    let giaPhong = giaPhongs[0].gia2GioDau || giaPhongs[0].giaTheoNgay || 0;

    // Cập nhật giá cho phòng
    await db.Phong.update({ gia: giaPhong }, { where: { maPhong: maPhong } });

    // Sau khi cập nhật giá cho phòng, cập nhật lại giá thấp nhất cho khách sạn
    const phong = await db.Phong.findByPk(maPhong, { attributes: ["maKS"] });
    if (phong) {
      await updateGiaThapNhat(phong.maKS);
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật giá cho phòng:", error);
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await Phong.findAll({
      where: {
        tenPhong: { [Op.like]: `%${q}%` },
      },
      include: [
        { model: db.KhachSan },
        { model: db.LoaiPhong },
        { model: db.GiaPhong },
        { model: db.KhuyenMai },
        { model: db.DatPhong },
        { model: db.TienNghiChiTiet },
        { model: db.SuCo },
      ],
    });
    res.status(200).json(items);
  } catch (error) {}
};
