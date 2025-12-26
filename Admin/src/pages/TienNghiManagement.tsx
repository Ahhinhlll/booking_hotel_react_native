import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { TienNghiService, TienNghi } from "../services/tienNghiService";
import { khachSanService } from "../services/khachSanService";
import { phongService } from "../services/phongService";
import SearchInput from "../components/SearchInput";

const { Title, Text } = Typography;

const TienNghiManagement: React.FC = () => {
  const [tienNghiList, setTienNghiList] = useState<TienNghi[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTienNghi, setEditingTienNghi] = useState<TienNghi | null>(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState("");
  const [hotels, setHotels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tienNghiData, hotelsData, roomsData] = await Promise.all([
        TienNghiService.getAll(),
        khachSanService.getAll(),
        phongService.getAll(),
      ]);

      setTienNghiList(tienNghiData);
      setHotels(hotelsData);
      setRooms(roomsData);
    } catch (error) {
      message.error("Không thể tải dữ liệu tiện ích");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await TienNghiService.search(query);
        setTienNghiList(results);
      } catch (error) {
        message.error("Không thể tìm kiếm tiện ích");
      }
    } else {
      loadData();
    }
  };

  const handleAdd = () => {
    setEditingTienNghi(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (tienNghi: TienNghi) => {
    setEditingTienNghi(tienNghi);
    form.setFieldsValue({
      tenTienNghi: tienNghi.tenTienNghi,
      maKS: tienNghi.maKS,
      maPhong: tienNghi.maPhong,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await TienNghiService.delete(id);
      message.success("Xóa tiện ích thành công");
      loadData();
    } catch (error) {
      message.error("Không thể xóa tiện ích");
      console.error("Error deleting tien nghi:", error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTienNghi) {
        await TienNghiService.update(editingTienNghi.maTienNghi, values);
        message.success("Cập nhật tiện ích thành công");
      } else {
        await TienNghiService.create(values);
        message.success("Tạo tiện ích thành công");
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error(
        editingTienNghi
          ? "Không thể cập nhật tiện ích"
          : "Không thể tạo tiện ích"
      );
      console.error("Error submitting tien nghi:", error);
    }
  };

  const getHotelName = (maKS?: string) => {
    if (!maKS) return "Chung";
    const hotel = hotels.find((h) => h.maKS === maKS);
    return hotel ? hotel.tenKS : "Không xác định";
  };

  const getRoomName = (maPhong?: string) => {
    if (!maPhong) return "Chung";
    const room = rooms.find((r) => r.maPhong === maPhong);
    return room ? room.tenPhong : "Không xác định";
  };

  const getScopeDescription = (record: TienNghi) => {
    if (!record.maKS && !record.maPhong) {
      return "Hiển thị ở tất cả khách sạn và phòng";
    } else if (record.maKS && !record.maPhong) {
      return "Hiển thị ở tất cả phòng của khách sạn này";
    } else if (record.maPhong) {
      return "Chỉ hiển thị ở phòng này";
    }
    return "Không xác định";
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
      title: "Tên tiện ích",
      dataIndex: "tenTienNghi",
      key: "tenTienNghi",
      render: (text: string, record: TienNghi) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Tag
            color={
              !record.maKS && !record.maPhong
                ? "purple"
                : record.maKS && !record.maPhong
                ? "blue"
                : record.maPhong
                ? "green"
                : "default"
            }
          >
            {!record.maKS && !record.maPhong
              ? "Chung"
              : record.maKS && !record.maPhong
              ? "Khách sạn"
              : record.maPhong
              ? "Phòng"
              : "Không xác định"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Khách sạn",
      dataIndex: "maKS",
      key: "maKS",
      render: (maKS: string, record: TienNghi) => {
        const isGeneral = !maKS && !record.maPhong;
        return (
          <Tag icon={<HomeOutlined />} color={isGeneral ? "purple" : "blue"}>
            {getHotelName(maKS)}
          </Tag>
        );
      },
    },
    {
      title: "Phòng",
      dataIndex: "maPhong",
      key: "maPhong",
      render: (maPhong: string, record: TienNghi) => {
        const isGeneral = !record.maKS && !maPhong;
        return (
          <Tag icon={<BankOutlined />} color={isGeneral ? "purple" : "green"}>
            {getRoomName(maPhong)}
          </Tag>
        );
      },
    },
    {
      title: "Phạm vi hiển thị",
      key: "scope",
      render: (_: any, record: TienNghi) => (
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {getScopeDescription(record)}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: TienNghi) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tiện ích này?"
            onConfirm={() => handleDelete(record.maTienNghi)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Thống kê
  const stats = {
    total: tienNghiList.length,
    hotelSpecific: tienNghiList.filter((t) => t.maKS && !t.maPhong).length,
    roomSpecific: tienNghiList.filter((t) => t.maPhong).length,
    general: tienNghiList.filter((t) => !t.maKS && !t.maPhong).length,
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Quản lý tiện ích</Title>

      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={6}>
          <Card>
            <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
              {stats.total}
            </Title>
            <Text type="secondary">Tổng tiện ích</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Title level={4} style={{ margin: 0, color: "#52c41a" }}>
              {stats.hotelSpecific}
            </Title>
            <Text type="secondary">Tiện ích khách sạn</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Title level={4} style={{ margin: 0, color: "#faad14" }}>
              {stats.roomSpecific}
            </Title>
            <Text type="secondary">Tiện ích phòng</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Title level={4} style={{ margin: 0, color: "#722ed1" }}>
              {stats.general}
            </Title>
            <Text type="secondary">Tiện ích chung</Text>
          </Card>
        </Col>
      </Row>

      {/* Thanh công cụ */}
      <Card style={{ marginBottom: "16px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <SearchInput
              placeholder="Tìm kiếm tiện ích..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={() => handleSearch(searchQuery)}
              onClear={() => {
                setSearchQuery("");
                loadData();
              }}
              style={{ width: 300 }}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm tiện ích
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bảng dữ liệu */}
      <Card>
        <Table
          columns={columns}
          dataSource={tienNghiList}
          rowKey="maTienNghi"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal thêm/sửa */}
      <Modal
        title={editingTienNghi ? "Sửa tiện ích" : "Thêm tiện ích mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="tenTienNghi"
            label="Tên tiện ích"
            rules={[
              { required: true, message: "Vui lòng nhập tên tiện ích" },
              { min: 2, message: "Tên tiện ích phải có ít nhất 2 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tên tiện ích" />
          </Form.Item>

          <Divider>Phạm vi áp dụng</Divider>

          <Form.Item
            name="maKS"
            label="Khách sạn"
            tooltip="Để trống nếu là tiện ích chung"
          >
            <Input.Group compact>
              <Form.Item name="maKS" noStyle>
                <Input
                  placeholder="Chọn khách sạn"
                  list="hotels"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Input.Group>
            <datalist id="hotels">
              {hotels.map((hotel) => (
                <option key={hotel.maKS} value={hotel.maKS}>
                  {hotel.tenKS}
                </option>
              ))}
            </datalist>
          </Form.Item>

          <Form.Item
            name="maPhong"
            label="Phòng cụ thể"
            tooltip="Để trống nếu áp dụng cho toàn khách sạn"
          >
            <Input.Group compact>
              <Form.Item name="maPhong" noStyle>
                <Input
                  placeholder="Chọn phòng cụ thể"
                  list="rooms"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Input.Group>
            <datalist id="rooms">
              {rooms.map((room) => (
                <option key={room.maPhong} value={room.maPhong}>
                  {room.tenPhong} - {getHotelName(room.maKS)}
                </option>
              ))}
            </datalist>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingTienNghi ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TienNghiManagement;
