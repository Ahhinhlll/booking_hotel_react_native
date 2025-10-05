import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Popconfirm, DatePicker, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { datPhongService } from '../services/datPhongService';
import { nguoiDungService } from '../services/nguoiDungService';
import { khachSanService } from '../services/khachSanService';
import { phongService } from '../services/phongService';
import { DatPhong, NguoiDung, KhachSan, Phong } from '../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const BookingManagement = () => {
  const [bookings, setBookings] = useState<DatPhong[]>([]);
  const [users, setUsers] = useState<NguoiDung[]>([]);
  const [hotels, setHotels] = useState<KhachSan[]>([]);
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState<DatPhong | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<DatPhong | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadBookings();
    loadUsers();
    loadHotels();
    loadRooms();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await datPhongService.getAll();
      setBookings(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách đặt phòng!');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await nguoiDungService.getAll();
      setUsers(data.filter(u => u.maVaiTro === 'VT03')); // Chỉ lấy khách hàng
    } catch (error) {
      console.error('Error loading users:', error);
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

  const loadRooms = async () => {
    try {
      const data = await phongService.getAll();
      setRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const handleAdd = () => {
    setEditingBooking(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (booking: DatPhong) => {
    setEditingBooking(booking);
    form.setFieldsValue({
      ...booking,
      dateRange: [dayjs(booking.ngayNhanPhong), dayjs(booking.ngayTraPhong)],
    });
    setModalVisible(true);
  };

  const handleViewDetail = (booking: DatPhong) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await datPhongService.delete(id);
      message.success('Xóa đặt phòng thành công!');
      loadBookings();
    } catch (error) {
      message.error('Lỗi khi xóa đặt phòng!');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        ngayNhanPhong: values.dateRange[0].format('YYYY-MM-DD'),
        ngayTraPhong: values.dateRange[1].format('YYYY-MM-DD'),
        dateRange: undefined,
      };
      delete submitData.dateRange;

      if (editingBooking) {
        await datPhongService.update({ ...submitData, maDatPhong: editingBooking.maDatPhong });
        message.success('Cập nhật đặt phòng thành công!');
      } else {
        await datPhongService.create(submitData);
        message.success('Thêm đặt phòng thành công!');
      }
      setModalVisible(false);
      loadBookings();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const columns = [
    {
      title: 'Mã đặt phòng',
      dataIndex: 'maDatPhong',
      key: 'maDatPhong',
      render: (text: string) => text.slice(0, 8) + '...',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'NguoiDung',
      key: 'customer',
      render: (nguoiDung: any) => nguoiDung?.hoTen || 'N/A',
    },
    {
      title: 'Khách sạn',
      dataIndex: 'KhachSan',
      key: 'hotel',
      render: (khachSan: any) => khachSan?.tenKS || 'N/A',
    },
    {
      title: 'Phòng',
      dataIndex: 'Phong',
      key: 'room',
      render: (phong: any) => phong?.tenPhong || 'N/A',
    },
    {
      title: 'Ngày nhận',
      dataIndex: 'ngayNhanPhong',
      key: 'ngayNhanPhong',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày trả',
      dataIndex: 'ngayTraPhong',
      key: 'ngayTraPhong',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'tongTien',
      key: 'tongTien',
      render: (amount: number) => `${amount.toLocaleString()} VNĐ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (status: string) => {
        const color = 
          status === 'Đã xác nhận' ? 'green' :
          status === 'Chờ xác nhận' ? 'orange' :
          status === 'Đã hủy' ? 'red' : 'blue';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: DatPhong) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa đặt phòng này?"
            onConfirm={() => handleDelete(record.maDatPhong)}
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
        <h1>Quản lý Đặt phòng</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="maDatPhong"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingBooking ? 'Sửa đặt phòng' : 'Thêm đặt phòng'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Khách hàng"
            name="maNguoiDung"
            rules={[{ required: true, message: 'Vui lòng chọn khách hàng!' }]}
          >
            <Select showSearch optionFilterProp="children">
              {users.map((user) => (
                <Select.Option key={user.maNguoiDung} value={user.maNguoiDung}>
                  {user.hoTen} - {user.email}
                </Select.Option>
              ))}
            </Select>
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
            label="Phòng"
            name="maPhong"
            rules={[{ required: true, message: 'Vui lòng chọn phòng!' }]}
          >
            <Select showSearch optionFilterProp="children">
              {rooms.map((room) => (
                <Select.Option key={room.maPhong} value={room.maPhong}>
                  {room.tenPhong} - {room.KhachSan?.tenKS}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày nhận - Ngày trả"
            name="dateRange"
            rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
          >
            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Số người lớn"
            name="soNguoiLon"
            rules={[{ required: true, message: 'Vui lòng nhập số người lớn!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Số trẻ em"
            name="soTreEm"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Tổng tiền"
            name="tongTien"
            rules={[{ required: true, message: 'Vui lòng nhập tổng tiền!' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="ghiChu">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="trangThai"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Select.Option value="Chờ xác nhận">Chờ xác nhận</Select.Option>
              <Select.Option value="Đã xác nhận">Đã xác nhận</Select.Option>
              <Select.Option value="Đã hủy">Đã hủy</Select.Option>
              <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết đặt phòng"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedBooking && (
          <div>
            <p><strong>Mã đặt phòng:</strong> {selectedBooking.maDatPhong}</p>
            <p><strong>Khách hàng:</strong> {selectedBooking.NguoiDung?.hoTen}</p>
            <p><strong>Email:</strong> {selectedBooking.NguoiDung?.email}</p>
            <p><strong>SĐT:</strong> {selectedBooking.NguoiDung?.sdt}</p>
            <p><strong>Khách sạn:</strong> {selectedBooking.KhachSan?.tenKS}</p>
            <p><strong>Phòng:</strong> {selectedBooking.Phong?.tenPhong}</p>
            <p><strong>Ngày nhận phòng:</strong> {dayjs(selectedBooking.ngayNhanPhong).format('DD/MM/YYYY')}</p>
            <p><strong>Ngày trả phòng:</strong> {dayjs(selectedBooking.ngayTraPhong).format('DD/MM/YYYY')}</p>
            <p><strong>Số người lớn:</strong> {selectedBooking.soNguoiLon}</p>
            <p><strong>Số trẻ em:</strong> {selectedBooking.soTreEm}</p>
            <p><strong>Tổng tiền:</strong> {selectedBooking.tongTien.toLocaleString()} VNĐ</p>
            <p><strong>Trạng thái:</strong> <Tag color={selectedBooking.trangThai === 'Đã xác nhận' ? 'green' : 'orange'}>{selectedBooking.trangThai}</Tag></p>
            {selectedBooking.ghiChu && <p><strong>Ghi chú:</strong> {selectedBooking.ghiChu}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingManagement;

