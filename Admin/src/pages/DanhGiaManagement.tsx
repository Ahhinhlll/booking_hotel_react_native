import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Popconfirm,
  Rate,
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { danhGiaService } from "../services/danhGiaService";
import { datPhongService } from "../services/datPhongService";
import { khachSanService } from "../services/khachSanService";
import { DanhGia, DatPhong, KhachSan } from "../types";
import useSearch from "../hooks/useSearch";
import SearchInput from "../components/SearchInput";

const DanhGiaManagement = () => {
  const [danhGias, setDanhGias] = useState<DanhGia[]>([]);
  const [completedBookings, setCompletedBookings] = useState<DatPhong[]>([]);
  const [hotels, setHotels] = useState<KhachSan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingDanhGia, setEditingDanhGia] = useState<DanhGia | null>(null);
  const [viewingDanhGia, setViewingDanhGia] = useState<DanhGia | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<DatPhong | null>(null);
  const [form] = Form.useForm();

  // Client-side search hook
  const { searchTerm, setSearchTerm, searchResults, clearSearch } = useSearch(
    danhGias,
    {
      keys: ["binhLuan"],
      threshold: 0.3,
    }
  );

  useEffect(() => {
    loadDanhGias();
    loadCompletedBookings();
    loadHotels();
  }, []);

  const loadDanhGias = async () => {
    setLoading(true);
    try {
      const data = await danhGiaService.getAll();
      setDanhGias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading reviews:", error);
      message.error("Lỗi khi tải danh sách đánh giá!");
      setDanhGias([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedBookings = async () => {
    try {
      const data = await datPhongService.getAll();
      // Lọc các booking đã hoàn thành (trạng thái "Đã trả phòng" hoặc "Hoàn thành")
      const completed = data.filter(
        (booking: DatPhong) =>
          booking.trangThai === "Đã trả phòng" ||
          booking.trangThai === "Hoàn thành"
      );
      setCompletedBookings(completed);
    } catch (error) {
      console.error("Error loading completed bookings:", error);
      setCompletedBookings([]);
    }
  };

  const loadHotels = async () => {
    try {
      const data = await khachSanService.getAll();
      setHotels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading hotels:", error);
      setHotels([]);
    }
  };

  const handleSearch = () => {
    // Search is handled by the useSearch hook automatically
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  const handleAddFromBooking = (booking: DatPhong) => {
    setSelectedBooking(booking);
    form.resetFields();
    form.setFieldsValue({
      maKS: booking.maKS,
      maND: booking.maND,
      maDatPhong: booking.maDatPhong,
    });
    setModalVisible(true);
  };

  const handleEdit = (danhGia: DanhGia) => {
    setEditingDanhGia(danhGia);
    setSelectedBooking(null);
    form.setFieldsValue(danhGia);
    setModalVisible(true);
  };

  const handleView = (danhGia: DanhGia) => {
    setViewingDanhGia(danhGia);
    setViewModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await danhGiaService.delete(id);
      message.success("Xóa đánh giá thành công!");
      loadDanhGias();
    } catch (error) {
      message.error("Lỗi khi xóa đánh giá!");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingDanhGia) {
        await danhGiaService.update(editingDanhGia.maDG, values);
        message.success("Cập nhật đánh giá thành công!");
      } else {
        await danhGiaService.create(values);
        message.success("Thêm đánh giá thành công!");
      }
      setModalVisible(false);
      loadDanhGias();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "NguoiDung",
      key: "nguoiDung",
      render: (nguoiDung: any) => nguoiDung?.hoTen || "N/A",
    },
    {
      title: "Khách sạn",
      dataIndex: "KhachSan",
      key: "khachSan",
      render: (khachSan: any) => khachSan?.tenKS || "N/A",
    },
    {
      title: "Điểm đánh giá",
      dataIndex: "soSao",
      key: "soSao",
      render: (rating: number) => (
        <Space>
          <Rate disabled value={rating} />
          <span>({rating}/5)</span>
        </Space>
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "binhLuan",
      key: "binhLuan",
      render: (content: string) =>
        content ? (
          <div
            style={{
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {content}
          </div>
        ) : (
          "Không có nội dung"
        ),
    },
    {
      title: "Ngày đánh giá",
      dataIndex: "ngayDG",
      key: "ngayDG",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: DanhGia) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa đánh giá này?"
            onConfirm={() => handleDelete(record.maDG)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Tính toán thống kê
  const totalReviews = danhGias.length;
  const averageRating =
    totalReviews > 0
      ? (
          danhGias.reduce((sum, review) => sum + review.soSao, 0) / totalReviews
        ).toFixed(1)
      : 0;
  const pendingReviews = completedBookings.length;

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1>Quản lý Đánh giá</h1>
      </div>

      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng đánh giá"
              value={totalReviews}
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Điểm trung bình"
              value={averageRating}
              suffix="/5"
              precision={1}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Chờ đánh giá"
              value={pendingReviews}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tìm kiếm */}
      <SearchInput
        placeholder="Tìm kiếm đánh giá..."
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        loading={loading}
      />

      {/* Tab đánh giá và booking */}
      <div style={{ marginBottom: 16 }}>
        <h2>Danh sách đánh giá</h2>
        <Table
          columns={columns}
          dataSource={searchResults}
          rowKey="maDG"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Modal thêm/sửa đánh giá */}
      <Modal
        title={editingDanhGia ? "Sửa đánh giá" : "Thêm đánh giá"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Khách sạn"
            name="maKS"
            rules={[{ required: true, message: "Vui lòng chọn khách sạn!" }]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              placeholder="Chọn khách sạn"
              disabled={!!selectedBooking}
            >
              {hotels.map((hotel) => (
                <Select.Option key={hotel.maKS} value={hotel.maKS}>
                  {hotel.tenKS}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Điểm đánh giá"
            name="soSao"
            rules={[
              { required: true, message: "Vui lòng chọn điểm đánh giá!" },
            ]}
          >
            <Rate />
          </Form.Item>

          <Form.Item label="Nội dung đánh giá" name="binhLuan">
            <Input.TextArea rows={4} placeholder="Nhập nội dung đánh giá..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết đánh giá */}
      <Modal
        title="Chi tiết đánh giá"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {viewingDanhGia && (
          <div>
            <p>
              <strong>Khách hàng:</strong> {viewingDanhGia.NguoiDung?.hoTen}
            </p>
            <p>
              <strong>Khách sạn:</strong> {viewingDanhGia.KhachSan?.tenKS}
            </p>
            <p>
              <strong>Điểm đánh giá:</strong>
              <Rate
                disabled
                value={viewingDanhGia.soSao}
                style={{ marginLeft: 8 }}
              />
              <span style={{ marginLeft: 8 }}>({viewingDanhGia.soSao}/5)</span>
            </p>
            <p>
              <strong>Nội dung:</strong>
            </p>
            <div
              style={{
                padding: 12,
                backgroundColor: "#f5f5f5",
                borderRadius: 6,
                minHeight: 60,
              }}
            >
              {viewingDanhGia.binhLuan || "Không có nội dung"}
            </div>
            <p>
              <strong>Ngày đánh giá:</strong>
              {new Date(viewingDanhGia.ngayDG).toLocaleDateString("vi-VN")}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DanhGiaManagement;
