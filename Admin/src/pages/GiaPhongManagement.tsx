import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  message,
  Tag,
  Popconfirm,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { giaPhongService } from "../services/giaPhongService";
import { phongService } from "../services/phongService";
import { GiaPhong, Phong } from "../types";
import useSearch from "../hooks/useSearch";
import SearchInput from "../components/SearchInput";

const GiaPhongManagement = () => {
  const [giaPhongs, setGiaPhongs] = useState<GiaPhong[]>([]);
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGiaPhong, setEditingGiaPhong] = useState<GiaPhong | null>(null);
  const [expandedHotels, setExpandedHotels] = useState<string[]>([]);
  const [form] = Form.useForm();

  // Client-side search hook
  const { searchTerm, setSearchTerm, searchResults, clearSearch } = useSearch(
    giaPhongs,
    {
      keys: ["loaiDat"],
      threshold: 0.3,
    }
  );

  useEffect(() => {
    loadGiaPhongs();
    loadRooms();
  }, []);

  const loadGiaPhongs = async () => {
    setLoading(true);
    try {
      const data = await giaPhongService.getAll();
      setGiaPhongs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading room prices:", error);
      message.error("Lỗi khi tải danh sách giá phòng!");
      setGiaPhongs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const data = await phongService.getAll();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading rooms:", error);
      setRooms([]);
    }
  };

  const handleSearch = () => {
    // Search is handled by the useSearch hook automatically
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  const handleAdd = () => {
    setEditingGiaPhong(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (giaPhong: GiaPhong) => {
    setEditingGiaPhong(giaPhong);
    form.setFieldsValue(giaPhong);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await giaPhongService.delete(id);
      message.success("Xóa giá phòng thành công!");
      loadGiaPhongs();
    } catch (error) {
      message.error("Lỗi khi xóa giá phòng!");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingGiaPhong) {
        await giaPhongService.update({
          ...values,
          maGiaPhong: editingGiaPhong.maGiaPhong,
        });
        message.success("Cập nhật giá phòng thành công!");
      } else {
        await giaPhongService.create(values);
        message.success("Thêm giá phòng thành công!");
      }
      setModalVisible(false);
      loadGiaPhongs();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  // Group gia phong by hotel
  const groupedGiaPhongs = searchResults.reduce((acc, giaPhong) => {
    const hotelId = giaPhong.Phong?.maKS || "unknown";

    if (!acc[hotelId]) {
      acc[hotelId] = {
        hotel: giaPhong.Phong?.KhachSan || {
          tenKS: "Khách sạn không xác định",
          diaChi: "",
        },
        giaPhongs: [],
      };
    }
    acc[hotelId].giaPhongs.push(giaPhong);
    return acc;
  }, {} as Record<string, { hotel: any; giaPhongs: GiaPhong[] }>);

  const toggleHotelExpansion = (hotelId: string) => {
    setExpandedHotels((prev) =>
      prev.includes(hotelId)
        ? prev.filter((id) => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  const columns = [
    {
      title: "#",
      key: "stt",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Phòng",
      dataIndex: "Phong",
      key: "phong",
      render: (phong: any) => phong?.tenPhong || "N/A",
    },
    {
      title: "Loại đặt",
      dataIndex: "loaiDat",
      key: "loaiDat",
      render: (loaiDat: string) => (
        <Tag
          color={
            loaiDat === "Theo giờ"
              ? "blue"
              : loaiDat === "Theo ngày"
              ? "green"
              : "orange"
          }
        >
          {loaiDat}
        </Tag>
      ),
    },
    {
      title: "Giá 2 giờ đầu",
      dataIndex: "gia2GioDau",
      key: "gia2GioDau",
      render: (price: number) =>
        price ? `${price.toLocaleString()} VNĐ` : "N/A",
    },
    {
      title: "Giá 1 giờ thêm",
      dataIndex: "gia1GioThem",
      key: "gia1GioThem",
      render: (price: number) =>
        price ? `${price.toLocaleString()} VNĐ` : "N/A",
    },
    {
      title: "Giá theo ngày",
      dataIndex: "giaTheoNgay",
      key: "giaTheoNgay",
      render: (price: number) =>
        price ? `${price.toLocaleString()} VNĐ` : "N/A",
    },
    {
      title: "Giá qua đêm",
      dataIndex: "giaQuaDem",
      key: "giaQuaDem",
      render: (price: number) =>
        price ? `${price.toLocaleString()} VNĐ` : "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (status: string) => (
        <Tag color={status === "Hoạt động" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: GiaPhong) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa giá phòng này?"
            onConfirm={() => handleDelete(record.maGiaPhong)}
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

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1>Quản lý Giá Phòng</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm mới
        </Button>
      </div>

      <SearchInput
        placeholder="Tìm kiếm giá phòng..."
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        loading={loading}
      />

      <div style={{ background: "#fff", borderRadius: "8px", padding: "16px" }}>
        {Object.keys(groupedGiaPhongs).length > 0 ? (
          Object.entries(groupedGiaPhongs).map(
            ([hotelId, { hotel, giaPhongs: hotelGiaPhongs }]) => (
              <div
                key={hotelId}
                style={{
                  marginBottom: "16px",
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                }}
              >
                {/* Hotel Header */}
                <div
                  style={{
                    padding: "16px",
                    background: "#fafafa",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: "8px 8px 0 0",
                  }}
                  onClick={() => toggleHotelExpansion(hotelId)}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {expandedHotels.includes(hotelId) ? (
                      <DownOutlined
                        style={{ marginRight: "8px", color: "#1890ff" }}
                      />
                    ) : (
                      <RightOutlined
                        style={{ marginRight: "8px", color: "#1890ff" }}
                      />
                    )}
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        {hotel?.tenKS || "Khách sạn không xác định"}
                      </h3>
                      <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                        {hotel?.diaChi || ""} • {hotelGiaPhongs.length} giá
                        phòng
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                      {
                        hotelGiaPhongs.filter(
                          (giaPhong) => giaPhong.trangThai === "Hoạt động"
                        ).length
                      }
                      hoạt động
                    </div>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                      {
                        hotelGiaPhongs.filter(
                          (giaPhong) => giaPhong.trangThai === "Không hoạt động"
                        ).length
                      }
                      không hoạt động
                    </div>
                  </div>
                </div>

                {/* Gia Phong Table */}
                {expandedHotels.includes(hotelId) && (
                  <div style={{ padding: "16px" }}>
                    <Table
                      columns={columns}
                      dataSource={hotelGiaPhongs}
                      rowKey="maGiaPhong"
                      pagination={false}
                      size="small"
                    />
                  </div>
                )}
              </div>
            )
          )
        ) : searchResults.length > 0 ? (
          // Fallback: Show all data in a single table if grouping fails
          <div>
            <h3 style={{ marginBottom: "16px" }}>Tất cả giá phòng</h3>
            <Table
              columns={columns}
              dataSource={searchResults}
              rowKey="maGiaPhong"
              pagination={{ pageSize: 10 }}
            />
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            Không có giá phòng nào
          </div>
        )}
      </div>

      <Modal
        title={editingGiaPhong ? "Sửa giá phòng" : "Thêm giá phòng"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Phòng"
            name="maPhong"
            rules={[{ required: true, message: "Vui lòng chọn phòng!" }]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              placeholder="Chọn phòng"
            >
              {rooms.map((room) => (
                <Select.Option key={room.maPhong} value={room.maPhong}>
                  {room.tenPhong} - {room.KhachSan?.tenKS}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Loại đặt"
            name="loaiDat"
            rules={[{ required: true, message: "Vui lòng chọn loại đặt!" }]}
          >
            <Select placeholder="Chọn loại đặt">
              <Select.Option value="Theo giờ">Theo giờ</Select.Option>
              <Select.Option value="Theo ngày">Theo ngày</Select.Option>
              <Select.Option value="Qua đêm">Qua đêm</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá 2 giờ đầu (VNĐ)"
            name="gia2GioDau"
            rules={[
              { required: true, message: "Vui lòng nhập giá 2 giờ đầu!" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="Giá 1 giờ thêm (VNĐ)"
            name="gia1GioThem"
            rules={[
              { required: true, message: "Vui lòng nhập giá 1 giờ thêm!" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="Giá theo ngày (VNĐ)"
            name="giaTheoNgay"
            rules={[
              { required: true, message: "Vui lòng nhập giá theo ngày!" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="Giá qua đêm (VNĐ)"
            name="giaQuaDem"
            rules={[{ required: true, message: "Vui lòng nhập giá qua đêm!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="trangThai"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="Hoạt động">Hoạt động</Select.Option>
              <Select.Option value="Không hoạt động">
                Không hoạt động
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GiaPhongManagement;
