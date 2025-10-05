import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { khachSanService } from '../services/khachSanService';
import { KhachSan } from '../types';
import ImageUpload from '../components/ImageUpload';
import ImageDisplay from '../components/ImageDisplay';

const HotelManagement = () => {
  const [hotels, setHotels] = useState<KhachSan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHotel, setEditingHotel] = useState<KhachSan | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const data = await khachSanService.getAll();
      setHotels(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách khách sạn!');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      loadHotels();
      return;
    }
    
    setLoading(true);
    try {
      const data = await khachSanService.search(searchText);
      setHotels(data);
    } catch (error) {
      message.error('Lỗi khi tìm kiếm!');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingHotel(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (hotel: KhachSan) => {
    setEditingHotel(hotel);
    form.setFieldsValue(hotel);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await khachSanService.delete(id);
      message.success('Xóa khách sạn thành công!');
      loadHotels();
    } catch (error) {
      message.error('Lỗi khi xóa khách sạn!');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingHotel) {
        await khachSanService.update({ ...values, maKS: editingHotel.maKS });
        message.success('Cập nhật khách sạn thành công!');
      } else {
        await khachSanService.create(values);
        message.success('Thêm khách sạn thành công!');
      }
      setModalVisible(false);
      loadHotels();
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
      title: 'Tên khách sạn',
      dataIndex: 'tenKS',
      key: 'tenKS',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'diaChi',
      key: 'diaChi',
    },
    {
      title: 'Tỉnh/Thành',
      dataIndex: 'tinhThanh',
      key: 'tinhThanh',
    },
    {
      title: 'Điện thoại',
      dataIndex: 'dienThoai',
      key: 'dienThoai',
    },
    {
      title: 'Hạng sao',
      dataIndex: 'hangSao',
      key: 'hangSao',
      render: (stars: number) => '⭐'.repeat(stars),
    },
    {
      title: 'Giá thấp nhất',
      dataIndex: 'giaThapNhat',
      key: 'giaThapNhat',
      render: (price: number) => price ? `${price.toLocaleString()} VNĐ` : 'N/A',
    },
    {
      title: 'Điểm đánh giá',
      dataIndex: 'diemDanhGia',
      key: 'diemDanhGia',
      render: (score: number) => <Tag color="blue">{score}/10</Tag>,
    },
    {
      title: 'Nổi bật',
      dataIndex: 'noiBat',
      key: 'noiBat',
      render: (featured: string) => (
        <Tag color={featured === 'Nổi bật' ? 'gold' : 'default'}>{featured}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (status: string) => (
        <Tag color={status === 'Hoạt động' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: KhachSan) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa khách sạn này?"
            onConfirm={() => handleDelete(record.maKS)}
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
        <h1>Quản lý Khách sạn</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm mới
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm khách sạn..."
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
        dataSource={hotels}
        rowKey="maKS"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingHotel ? 'Sửa khách sạn' : 'Thêm khách sạn'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Ảnh khách sạn"
            name="anh"
          >
            <ImageUpload maxCount={10} />
          </Form.Item>

          <Form.Item
            label="Tên khách sạn"
            name="tenKS"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách sạn!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="diaChi"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Tỉnh/Thành phố"
            name="tinhThanh"
            rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Điện thoại"
            name="dienThoai"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Hạng sao"
            name="hangSao"
            rules={[{ required: true, message: 'Vui lòng chọn hạng sao!' }]}
          >
            <Select>
              <Select.Option value={1}>1 sao</Select.Option>
              <Select.Option value={2}>2 sao</Select.Option>
              <Select.Option value={3}>3 sao</Select.Option>
              <Select.Option value={4}>4 sao</Select.Option>
              <Select.Option value={5}>5 sao</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá thấp nhất"
            name="giaThapNhat"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="Điểm đánh giá"
            name="diemDanhGia"
          >
            <InputNumber min={0} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Nổi bật"
            name="noiBat"
          >
            <Select>
              <Select.Option value="Nổi bật">Nổi bật</Select.Option>
              <Select.Option value="Bình thường">Bình thường</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="trangThai"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Select.Option value="Hoạt động">Hoạt động</Select.Option>
              <Select.Option value="Không hoạt động">Không hoạt động</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HotelManagement;

