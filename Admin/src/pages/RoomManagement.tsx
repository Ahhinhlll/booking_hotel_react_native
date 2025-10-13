import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { phongService } from '../services/phongService';
import { khachSanService } from '../services/khachSanService';
import { loaiPhongService } from '../services/loaiPhongService';
import { Phong, KhachSan, LoaiPhong } from '../types';
import ImageUpload from '../components/ImageUpload';
import ImageDisplay from '../components/ImageDisplay';

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [hotels, setHotels] = useState<KhachSan[]>([]);
  const [roomTypes, setRoomTypes] = useState<LoaiPhong[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Phong | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

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
      console.error('Error loading rooms:', error);
      message.error('Lỗi khi tải danh sách phòng!');
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
      console.error('Error loading hotels:', error);
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
      console.error('Error loading room types:', error);
      setRoomTypes([]);
    }
  };

  const createDefaultRoomTypes = async () => {
    const defaultRoomTypes = [
      { tenLoaiPhong: 'Phòng đơn', moTa: 'Phòng dành cho 1 người' },
      { tenLoaiPhong: 'Phòng đôi', moTa: 'Phòng dành cho 2 người' },
      { tenLoaiPhong: 'Phòng gia đình', moTa: 'Phòng dành cho gia đình' },
      { tenLoaiPhong: 'Phòng VIP', moTa: 'Phòng cao cấp với đầy đủ tiện nghi' },
    ];

    try {
      for (const roomType of defaultRoomTypes) {
        await loaiPhongService.create(roomType);
      }
      message.success('Đã tạo các loại phòng mặc định!');
    } catch (error) {
      console.error('Error creating default room types:', error);
      message.error('Lỗi khi tạo loại phòng mặc định!');
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
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error searching rooms:', error);
      message.error('Lỗi khi tìm kiếm!');
      setRooms([]);
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
    // Exclude gia from form values as it's calculated automatically from GiaPhong
    const { gia, ...formValues } = room as any;
    form.setFieldsValue(formValues);
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
      // Remove gia as it's calculated automatically from GiaPhong
      const { gia, ...submitData } = values;
      
      if (editingRoom) {
        await phongService.update({ ...submitData, maPhong: editingRoom.maPhong });
        message.success('Cập nhật phòng thành công!');
      } else {
        await phongService.create(submitData);
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
      title: 'Giá phòng (TB)',
      dataIndex: 'gia',
      key: 'gia',
      render: (price: number) => price ? `${price.toLocaleString()} VNĐ` : 'Chưa có giá',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (status: string) => (
        <Tag color={status === 'Trống' ? 'green' : status === 'Đã đặt' ? 'red' : 'orange'}>
          {status}
        </Tag>
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
            <Select showSearch optionFilterProp="children">
              {roomTypes.map((roomType) => (
                <Select.Option key={roomType.maLoaiPhong} value={roomType.maLoaiPhong}>
                  {roomType.tenLoaiPhong}
                </Select.Option>
              ))}
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

          <Form.Item label="Mô tả" name="moTa">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="trangThai"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
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

