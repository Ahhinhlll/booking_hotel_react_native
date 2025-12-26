import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Popconfirm, DatePicker, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { khuyenMaiService } from '../services/khuyenMaiService';
import { khachSanService } from '../services/khachSanService';
import { KhuyenMai, KhachSan } from '../types';
import dayjs from 'dayjs';
import useSearch from '../hooks/useSearch';
import SearchInput from '../components/SearchInput';
import ImageDisplay from '../components/ImageDisplay';
import ImageUpload from '../components/ImageUpload';

const { RangePicker } = DatePicker;

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState<KhuyenMai[]>([]);
  const [hotels, setHotels] = useState<KhachSan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<KhuyenMai | null>(null);
  const [expandedHotels, setExpandedHotels] = useState<string[]>([]);
  const [form] = Form.useForm();

  // Client-side search hook
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    clearSearch
  } = useSearch(promotions, {
    keys: ['tenKM', 'thongTinKM'],
    threshold: 0.3
  });

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

  const handleSearch = () => {
    // Search is handled by the useSearch hook automatically
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  const toggleHotelExpansion = (hotelId: string) => {
    setExpandedHotels(prev => 
      prev.includes(hotelId) 
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  // Hàm kiểm tra khuyến mãi còn hạn hay không
  const isPromotionActive = (promotion: KhuyenMai): 'active' | 'expired' | 'upcoming' => {
    const now = dayjs();
    const startDate = dayjs(promotion.ngayBatDau);
    const endDate = dayjs(promotion.ngayKetThuc);
    
    if (now.isBefore(startDate)) {
      return 'upcoming'; // Chưa bắt đầu
    } else if (now.isAfter(endDate)) {
      return 'expired'; // Đã hết hạn
    } else {
      return 'active'; // Đang hoạt động
    }
  };

  // Group promotions by hotel
  const groupedPromotions = searchResults.reduce((acc, promotion) => {
    const hotelId = promotion.maKS;
    if (!acc[hotelId]) {
      acc[hotelId] = {
        hotel: hotels.find(h => h.maKS === hotelId),
        promotions: []
      };
    }
    acc[hotelId].promotions.push(promotion);
    return acc;
  }, {} as Record<string, { hotel: KhachSan | undefined; promotions: KhuyenMai[] }>);

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
      title: '#',
      key: 'stt',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Ảnh',
      dataIndex: 'anh',
      key: 'anh',
      width: 80,
      render: (images: string[]) => (
        <ImageDisplay images={images} width={50} height={50} />
      ),
    },
    {
      title: 'Tên khuyến mãi',
      dataIndex: 'tenKM',
      key: 'tenKM',
    },
    {
      title: 'Thông tin khuyến mãi',
      key: 'promotionInfo',
      render: (_: any, record: KhuyenMai) => (
        <div>
          <div style={{ marginBottom: '4px' }}>
            {(record.phanTramGiam || 0) > 0 && (
              <Tag color="blue">
                Giảm {record.phanTramGiam}%
              </Tag>
            )}
            {(record.giaTriGiam || 0) > 0 && (
              <Tag color="green">
                {(record.giaTriGiam || 0).toLocaleString()} VNĐ
              </Tag>
            )}
            {(record.phanTramGiam || 0) <= 0 && (record.giaTriGiam || 0) <= 0 && (
              <Tag color="default">
                Không có giảm giá
              </Tag>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {(record as any).thongTinKM && (record as any).thongTinKM.length > 50 
              ? `${(record as any).thongTinKM.substring(0, 50)}...` 
              : (record as any).thongTinKM || 'Không có mô tả'
            }
          </div>
        </div>
      ),
    },
    {
      title: 'Thời gian áp dụng',
      key: 'dateRange',
      render: (_: any, record: KhuyenMai) => (
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Từ: {dayjs(record.ngayBatDau).format('DD/MM/YYYY')}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Đến: {dayjs(record.ngayKetThuc).format('DD/MM/YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      render: (_: any, record: KhuyenMai) => {
        const status = isPromotionActive(record);
        const statusConfig = {
          active: { text: 'Còn hạn', color: 'green' },
          expired: { text: 'Hết hạn', color: 'red' },
          upcoming: { text: 'Sắp diễn ra', color: 'blue' },
        };
        return <Tag color={statusConfig[status].color}>{statusConfig[status].text}</Tag>;
      },
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

      <SearchInput
        placeholder="Tìm kiếm khuyến mãi..."
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        loading={loading}
      />

      <div style={{ background: '#fff', borderRadius: '8px', padding: '16px' }}>
        {Object.entries(groupedPromotions).map(([hotelId, { hotel, promotions: hotelPromotions }]) => (
          <div key={hotelId} style={{ marginBottom: '16px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
            {/* Hotel Header */}
            <div 
              style={{ 
                padding: '16px', 
                background: '#fafafa', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '8px 8px 0 0'
              }}
              onClick={() => toggleHotelExpansion(hotelId)}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {expandedHotels.includes(hotelId) ? (
                  <DownOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                ) : (
                  <RightOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                    {hotel?.tenKS || 'Khách sạn không xác định'}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {hotel?.diaChi || ''} • {hotelPromotions.length} khuyến mãi
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', color: '#52c41a' }}>
                  {hotelPromotions.filter(promo => isPromotionActive(promo) === 'active').length} còn hạn
                </div>
                <div style={{ fontSize: '14px', color: '#f5222d' }}>
                  {hotelPromotions.filter(promo => isPromotionActive(promo) === 'expired').length} hết hạn
                </div>
                <div style={{ fontSize: '14px', color: '#1890ff' }}>
                  {hotelPromotions.filter(promo => isPromotionActive(promo) === 'upcoming').length} sắp diễn ra
                </div>
              </div>
            </div>

            {/* Promotions Table */}
            {expandedHotels.includes(hotelId) && (
              <div style={{ padding: '16px' }}>
                <Table
                  columns={columns}
                  dataSource={hotelPromotions}
                  rowKey="maKM"
                  pagination={false}
                  size="small"
                />
              </div>
            )}
          </div>
        ))}
        
        {Object.keys(groupedPromotions).length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Không có khuyến mãi nào
          </div>
        )}
      </div>

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
            label="Thông tin khuyến mãi"
            name="thongTinKM"
            rules={[{ required: true, message: 'Vui lòng nhập thông tin khuyến mãi!' }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết về khuyến mãi..." />
          </Form.Item>

          <Form.Item
            label="Ảnh khuyến mãi"
            name="anh"
          >
            <ImageUpload maxCount={1} />
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

