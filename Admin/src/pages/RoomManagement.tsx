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
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import useSearch from "../hooks/useSearch";
import SearchInput from "../components/SearchInput";
import { phongService } from "../services/phongService";
import { khachSanService } from "../services/khachSanService";
import { loaiPhongService } from "../services/loaiPhongService";
import { Phong, KhachSan, LoaiPhong } from "../types";
import ImageUpload from "../components/ImageUpload";
import ImageDisplay from "../components/ImageDisplay";

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [hotels, setHotels] = useState<KhachSan[]>([]);
  const [roomTypes, setRoomTypes] = useState<LoaiPhong[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Phong | null>(null);
  const [expandedHotels, setExpandedHotels] = useState<string[]>([]);
  const [form] = Form.useForm();

  // Client-side search hook
  const { searchTerm, setSearchTerm, searchResults, clearSearch } = useSearch(
    rooms,
    {
      keys: ["tenPhong", "moTa"],
      threshold: 0.3,
    }
  );

  useEffect(() => {
    loadRooms();
    loadHotels();
    loadRoomTypes();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await phongService.getAll();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading rooms:", error);
      message.error("Lỗi khi tải danh sách phòng!");
      setRooms([]);
    } finally {
      setLoading(false);
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

  const loadRoomTypes = async () => {
    try {
      const data = await loaiPhongService.getAll();
      const roomTypesData = Array.isArray(data) ? data : [];

      // If no room types exist, create default ones
      if (roomTypesData.length === 0) {
        await createDefaultRoomTypes();
        // Reload room types after creating defaults
        const newData = await loaiPhongService.getAll();
        setRoomTypes(Array.isArray(newData) ? newData : []);
      } else {
        setRoomTypes(roomTypesData);
      }
    } catch (error) {
      console.error("Error loading room types:", error);
      setRoomTypes([]);
    }
  };

  const createDefaultRoomTypes = async () => {
    const defaultRoomTypes = [
      { tenLoaiPhong: "Phòng đơn", moTa: "Phòng dành cho 1 người" },
      { tenLoaiPhong: "Phòng đôi", moTa: "Phòng dành cho 2 người" },
      { tenLoaiPhong: "Phòng gia đình", moTa: "Phòng dành cho gia đình" },
      { tenLoaiPhong: "Phòng VIP", moTa: "Phòng cao cấp với đầy đủ tiện nghi" },
    ];

    try {
      for (const roomType of defaultRoomTypes) {
        await loaiPhongService.create(roomType);
      }
      message.success("Đã tạo các loại phòng mặc định!");
    } catch (error) {
      console.error("Error creating default room types:", error);
      message.error("Lỗi khi tạo loại phòng mặc định!");
    }
  };

  const handleSearch = () => {
    // Search is handled by the useSearch hook automatically
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  const handleAdd = () => {
    setEditingRoom(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (room: Phong) => {
    setEditingRoom(room);
    // Exclude gia from form values as it's calculated automatically from GiaPhong
    const { gia, ...formValues } = room as any;
    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await phongService.delete(id);
      message.success("Xóa phòng thành công!");
      loadRooms();
    } catch (error) {
      message.error("Lỗi khi xóa phòng!");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // Remove gia as it's calculated automatically from GiaPhong
      const { gia, ...submitData } = values;

      if (editingRoom) {
        await phongService.update({
          ...submitData,
          maPhong: editingRoom.maPhong,
        });
        message.success("Cập nhật phòng thành công!");
      } else {
        await phongService.create(submitData);
        message.success("Thêm phòng thành công!");
      }
      setModalVisible(false);
      loadRooms();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  // Group rooms by hotel
  const groupedRooms = searchResults.reduce((acc, room) => {
    const hotelId = room.maKS;
    if (!acc[hotelId]) {
      acc[hotelId] = {
        hotel: room.KhachSan,
        rooms: [],
      };
    }
    acc[hotelId].rooms.push(room);
    return acc;
  }, {} as Record<string, { hotel: any; rooms: Phong[] }>);

  const toggleHotelExpansion = (hotelId: string) => {
    setExpandedHotels((prev) =>
      prev.includes(hotelId)
        ? prev.filter((id) => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  const roomColumns = [
    {
      title: "Ảnh",
      dataIndex: "anh",
      key: "anh",
      width: 80,
      render: (images: string[]) => (
        <ImageDisplay images={images} width={40} height={40} />
      ),
    },
    {
      title: "Tên phòng",
      dataIndex: "tenPhong",
      key: "tenPhong",
    },
    {
      title: "Loại phòng",
      dataIndex: "LoaiPhong",
      key: "loaiPhong",
      render: (loaiPhong: any) => loaiPhong?.tenLoaiPhong || "N/A",
    },
    {
      title: "Số giường",
      dataIndex: "soGiuong",
      key: "soGiuong",
    },
    {
      title: "Diện tích",
      dataIndex: "dienTich",
      key: "dienTich",
      render: (area: number) => `${area} m²`,
    },
    {
      title: "Sức chứa",
      dataIndex: "sucChua",
      key: "sucChua",
      render: (capacity: number) => `${capacity} người`,
    },
    {
      title: "Giá phòng (TB)",
      dataIndex: "gia",
      key: "gia",
      render: (price: number) =>
        price ? `${price.toLocaleString()} VNĐ` : "Chưa có giá",
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (status: string) => (
        <Tag
          color={
            status === "Trống"
              ? "green"
              : status === "Đã đặt"
              ? "red"
              : "orange"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Phong) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa phòng này?"
            onConfirm={() => handleDelete(record.maPhong)}
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
        <h1>Quản lý Phòng</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm mới
        </Button>
      </div>

      <SearchInput
        placeholder="Tìm kiếm phòng..."
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        loading={loading}
      />

      <div style={{ background: "#fff", borderRadius: "8px", padding: "16px" }}>
        {Object.entries(groupedRooms).map(
          ([hotelId, { hotel, rooms: hotelRooms }]) => (
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
                      {hotel?.diaChi || ""} • {hotelRooms.length} phòng
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {
                      hotelRooms.filter((room) => room.trangThai === "Trống")
                        .length
                    }
                    trống
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {
                      hotelRooms.filter((room) => room.trangThai === "Đã đặt")
                        .length
                    }
                    đã đặt
                  </div>
                </div>
              </div>

              {/* Rooms Table */}
              {expandedHotels.includes(hotelId) && (
                <div style={{ padding: "16px" }}>
                  <Table
                    columns={roomColumns}
                    dataSource={hotelRooms}
                    rowKey="maPhong"
                    pagination={false}
                    size="small"
                  />
                </div>
              )}
            </div>
          )
        )}

        {Object.keys(groupedRooms).length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            Không có phòng nào
          </div>
        )}
      </div>

      <Modal
        title={editingRoom ? "Sửa phòng" : "Thêm phòng"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Ảnh phòng" name="anh">
            <ImageUpload maxCount={10} />
          </Form.Item>

          <Form.Item
            label="Tên phòng"
            name="tenPhong"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Khách sạn"
            name="maKS"
            rules={[{ required: true, message: "Vui lòng chọn khách sạn!" }]}
          >
            <Select showSearch optionFilterProp="children">
              {hotels.map((hotel) => (
                <Select.Option key={hotel.maKS} value={hotel.maKS}>
                  {hotel.tenKS}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Loại phòng"
            name="maLoaiPhong"
            rules={[{ required: true, message: "Vui lòng chọn loại phòng!" }]}
          >
            <Select showSearch optionFilterProp="children">
              {roomTypes.map((roomType) => (
                <Select.Option
                  key={roomType.maLoaiPhong}
                  value={roomType.maLoaiPhong}
                >
                  {roomType.tenLoaiPhong}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Số giường"
            name="soGiuong"
            rules={[{ required: true, message: "Vui lòng nhập số giường!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Diện tích (m²)"
            name="dienTich"
            rules={[{ required: true, message: "Vui lòng nhập diện tích!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Sức chứa (người)"
            name="sucChua"
            rules={[{ required: true, message: "Vui lòng nhập sức chứa!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Mô tả" name="moTa">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="trangThai"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select>
              <Select.Option value="Trống">Trống</Select.Option>
              <Select.Option value="Đã đặt">Đã đặt</Select.Option>
              <Select.Option value="Bảo trì">Bảo trì</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;
