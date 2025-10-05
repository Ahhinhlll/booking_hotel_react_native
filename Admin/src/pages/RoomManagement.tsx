import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { phongService } from '../services/phongService';
import { khachSanService } from '../services/khachSanService';
import { Phong, KhachSan } from '../types';
import ImageUpload from '../components/ImageUpload';
import ImageDisplay from '../components/ImageDisplay';

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [hotels, setHotels] = useState<KhachSan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Phong | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadRooms();
    loadHotels();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await phongService.getAll();
      setRooms(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách phòng!');
    } finally {
      setLoading(false);
    }
  };

  const loadHotels = async () => {
    try {
      const data = await khachSanService.getAll();
      setHotels(data);
    } catch (error) {
      console.error('Error loading hotels:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      loadRooms();
      return;
    }
    
    setLoading(true);
    try {
      const data = await phongService.search(searchText);
      setRooms(data);
    } catch (error) {
      message.error('Lỗi khi tìm kiếm!');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRoom(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (room: Phong) => {
    setEditingRoom(room);
    form.setFieldsValue(room);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await phongService.delete(id);
      message.success('Xóa phòng thành công!');
      loadRooms();
    } catch (error) {
      message.error('Lỗi khi xóa phòng!');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRoom) {
        await phongService.update({ ...values, maPhong: editingRoom.maPhong });
        message.success('Cập nhật phòng thành công!');
      } else {
        await phongService.create(values);
        message.success('Thêm phòng thành công!');
      }
      setModalVisible(false);
      loadRooms();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'anh',
      key: 'anh',
      width: 100,
      render: (images: string[]) => <ImageDisplay images={images} width={50} height={50} />,
    },
    {
      title: 'Tên phòng',
      dataIndex: 'tenPhong',
      key: 'tenPhong',
    },
    {
      title: 'Khách sạn',
      dataIndex: 'KhachSan',
      key: 'hotel',
      render: (hotel: any) => hotel?.tenKS || 'N/A',
    },
    {
      title: 'Loại phòng',
      dataIndex: 'LoaiPhong',
      key: 'loaiPhong',
      render: (loaiPhong: any) => loaiPhong?.tenLoaiPhong || 'N/A',
    },
    {
      title: 'Số giường',
      dataIndex: 'soGiuong',
      key: 'soGiuong',
    },
    {
      title: 'Diện tích',
      dataIndex: 'dienTich',
      key: 'dienTich',
      render: (area: number) => `${area} m²`,
    },
    {
      title: 'Sức chứa',
      dataIndex: 'sucChua',
      key: 'sucChua',
      render: (capacity: number) => `${capacity} người`,
    },
    {
      title: 'Số lượng phòng',
      dataIndex: 'soLuongPhong',
      key: 'soLuongPhong',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (status: string) => (
        <Tag color={status === 'Còn phòng' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>Quản lý Phòng</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm mới
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm phòng..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
        />
        <Button icon={<SearchOutlined />} onClick={handleSearch}>
          Tìm kiếm
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={rooms}
        rowKey="maPhong"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRoom ? 'Sửa phòng' : 'Thêm phòng'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Ảnh phòng"
            name="anh"
          >
            <ImageUpload maxCount={10} />
          </Form.Item>

          <Form.Item
            label="Tên phòng"
            name="tenPhong"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Khách sạn"
            name="maKS"
            rules={[{ required: true, message: 'Vui lòng chọn khách sạn!' }]}
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
            rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
          >
            <Select>
              <Select.Option value="LP01">Phòng đơn</Select.Option>
              <Select.Option value="LP02">Phòng đôi</Select.Option>
              <Select.Option value="LP03">Phòng gia đình</Select.Option>
              <Select.Option value="LP04">Phòng VIP</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Số giường"
            name="soGiuong"
            rules={[{ required: true, message: 'Vui lòng nhập số giường!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Diện tích (m²)"
            name="dienTich"
            rules={[{ required: true, message: 'Vui lòng nhập diện tích!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Sức chứa (người)"
            name="sucChua"
            rules={[{ required: true, message: 'Vui lòng nhập sức chứa!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Số lượng phòng"
            name="soLuongPhong"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng phòng!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Mô tả" name="moTa">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="trangThai"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Select.Option value="Còn phòng">Còn phòng</Select.Option>
              <Select.Option value="Hết phòng">Hết phòng</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;

