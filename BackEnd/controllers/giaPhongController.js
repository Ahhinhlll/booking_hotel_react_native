const GiaPhong = require("../models/giaPhongModel");
const { Op } = require("sequelize");
const db = require("../models");
exports.getAll = async (req, res) => {
  try {
    const items = await GiaPhong.findAll({
      include: [{ model: db.Phong }],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await GiaPhong.findByPk(req.params.id, {
      include: [{ model: db.Phong }],
    });
    if (item) res.status(200).json(item);
    else res.status(404).json({ message: "Không tìm thấy giá phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.insert = async (req, res) => {
  try {
    const { maPhong } = req.body;
    if (!maPhong) {
      return res.status(400).json({ message: "Thiếu mã phòng" });
    }
    // Kiểm tra Phong tồn tại
    const phong = await db.Phong.findByPk(maPhong);
    if (!phong) {
      return res.status(400).json({ message: "Phòng không tồn tại" });
    }
    const newItem = await GiaPhong.create(req.body);

    // Cập nhật giá phòng dựa trên giá phòng mới
    await updateGiaPhongForPhong(maPhong);

    // Sau khi cập nhật giá phòng, cập nhật lại giá thấp nhất cho khách sạn
    await updateGiaThapNhatForPhong(maPhong);

    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await GiaPhong.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);

      // Cập nhật giá phòng dựa trên giá phòng mới
      await updateGiaPhongForPhong(item.maPhong);

      // Sau khi cập nhật giá phòng, cập nhật lại giá thấp nhất cho khách sạn
      await updateGiaThapNhatForPhong(item.maPhong);

      res.status(200).json(item);
    } else res.status(404).json({ message: "Không tìm thấy giá phòng" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const giaPhong = await GiaPhong.findByPk(req.params.id);
    if (!giaPhong) {
      return res.status(404).json({ message: "Không tìm thấy giá phòng" });
    }

    const maPhong = giaPhong.maPhong;
    const deleted = await GiaPhong.destroy({
      where: { maGiaPhong: req.params.id },
    });

    if (deleted) {
      // Cập nhật giá phòng dựa trên giá phòng còn lại (nếu có)
      await updateGiaPhongForPhong(maPhong);

      // Sau khi cập nhật giá phòng, cập nhật lại giá thấp nhất cho khách sạn
      await updateGiaThapNhatForPhong(maPhong);

      res.status(200).json({ message: "Xóa thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy giá phòng" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Hàm cập nhật giá thấp nhất cho khách sạn dựa trên phòng được thêm giá
const updateGiaThapNhatForPhong = async (maPhong) => {
  try {
    // Lấy thông tin phòng để biết mã khách sạn
    const phong = await db.Phong.findByPk(maPhong, {
      attributes: ["maKS"],
    });

    if (!phong) {
      return; // Không tìm thấy phòng
    }

    const maKS = phong.maKS;

    // Gọi hàm cập nhật giá thấp nhất cho khách sạn
    await updateGiaThapNhat(maKS);
  } catch (error) {
    console.error(
      "Lỗi khi cập nhật giá thấp nhất cho khách sạn từ giá phòng:",
      error
    );
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
      // Nếu không có giá phòng nào, không cập nhật giá phòng
      // và không cập nhật lại giá thấp nhất cho khách sạn
      return;
    }

    // Lấy giá theo 2 giờ đầu tiên (gia2GioDau) từ bản ghi đầu tiên
    // Nếu không có giá 2 giờ đầu, có thể sử dụng giá theo ngày như giá mặc định
    let giaPhong = giaPhongs[0].gia2GioDau || giaPhongs[0].giaTheoNgay || 0;

    // Cập nhật giá cho phòng
    await db.Phong.update({ gia: giaPhong }, { where: { maPhong: maPhong } });

    // Sau khi cập nhật giá cho phòng, cập nhật lại giá thấp nhất cho khách sạn
    await updateGiaThapNhatForPhong(maPhong);
  } catch (error) {
    console.error("Lỗi khi cập nhật giá cho phòng:", error);
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const items = await GiaPhong.findAll({
      where: {
        tenGia: { [Op.like]: `%${q}%` },
      },
      include: [{ model: db.Phong }],
    });
    res.status(200).json(items);
  } catch (error) {}
};
