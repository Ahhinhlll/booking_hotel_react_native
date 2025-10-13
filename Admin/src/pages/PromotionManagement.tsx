import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Popconfirm, DatePicker, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { khuyenMaiService } from '../services/khuyenMaiService';
import { khachSanService } from '../services/khachSanService';
import { KhuyenMai, KhachSan } from '../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState<KhuyenMai[]>([]);
  const [hotels, setHotels] = useState<KhachSan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<KhuyenMai | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadPromotions();
    loadHotels();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const data = await khuyenMaiService.getAll();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading promotions:', error);
      message.error('Lỗi khi tải danh sách khuyến mãi!');
      setPromotions([]);
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

  const handleSearch = async () => {
    if (!searchText.trim()) {
      loadPromotions();
      return;
    }
    
    setLoading(true);
    try {
      const data = await khuyenMaiService.search(searchText);
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error searching promotions:', error);
      message.error('Lỗi khi tìm kiếm!');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPromotion(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (promotion: KhuyenMai) => {
    setEditingPromotion(promotion);
    form.setFieldsValue({
      ...promotion,
      dateRange: [dayjs(promotion.ngayBatDau), dayjs(promotion.ngayKetThuc)],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await khuyenMaiService.delete(id);
      message.success('Xóa khuyến mãi thành công!');
      loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      message.error('Lỗi khi xóa khuyến mãi!');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        ngayBatDau: values.dateRange[0].format('YYYY-MM-DD'),
        ngayKetThuc: values.dateRange[1].format('YYYY-MM-DD'),
        dateRange: undefined,
      };
      delete submitData.dateRange;

      if (editingPromotion) {
        await khuyenMaiService.update({ ...submitData, maKM: editingPromotion.maKM });
        message.success('Cập nhật khuyến mãi thành công!');
      } else {
        await khuyenMaiService.create(submitData);
        message.success('Thêm khuyến mãi thành công!');
      }
      setModalVisible(false);
      loadPromotions();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const columns = [
    {
      title: 'Tên khuyến mãi',
      dataIndex: 'tenKM',
      key: 'tenKM',
    },
    {
      title: 'Khách sạn',
      dataIndex: 'KhachSan',
      key: 'hotel',
      render: (khachSan: any) => khachSan?.tenKS || 'N/A',
    },
   
    {
      title: 'Phần trăm giảm',
      dataIndex: 'phanTramGiam',
      key: 'phanTramGiam',
      render: (percent: number) => percent ? `${percent}%` : '0%',
    },
    {
      title: 'Giá trị giảm',
      dataIndex: 'giaTriGiam',
      key: 'giaTriGiam',
      render: (value: number) => value ? `${value.toLocaleString()} VNĐ` : '0 VNĐ',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'ngayBatDau',
      key: 'ngayBatDau',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'ngayKetThuc',
      key: 'ngayKetThuc',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
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
      render: (_: any, record: KhuyenMai) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa khuyến mãi này?"
            onConfirm={() => handleDelete(record.maKM)}
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
        <h1>Quản lý Khuyến mãi</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm mới
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm khuyến mãi..."
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
        dataSource={promotions}
        rowKey="maKM"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingPromotion ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên khuyến mãi"
            name="tenKM"
            rules={[{ required: true, message: 'Vui lòng nhập tên khuyến mãi!' }]}
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
            label="Phần trăm giảm (%)"
            name="phanTramGiam"
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Giá trị giảm (VNĐ)"
            name="giaTriGiam"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item
            label="Thời gian áp dụng"
            name="dateRange"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
          >
            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
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

export default PromotionManagement;

