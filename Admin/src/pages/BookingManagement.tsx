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
  const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{ available: boolean; message: string } | null>(null);

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
      // Ensure data is always an array
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      message.error('Lỗi khi tải danh sách đặt phòng!');
      setBookings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await nguoiDungService.getAll();
      const usersData = Array.isArray(data) ? data : [];
      setUsers(usersData.filter(u => u.maVaiTro === 'VT03')); // Chỉ lấy khách hàng
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
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

  const loadRooms = async () => {
    try {
      const data = await phongService.getAll();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setRooms([]);
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
      dateRange: [dayjs(booking.ngayNhan), dayjs(booking.ngayTra)],
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

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await datPhongService.updateStatus(id, newStatus);
      message.success('Cập nhật trạng thái thành công!');
      loadBookings();
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái!');
    }
  };

  const handleCheckAvailability = async (values: any) => {
    try {
      const result = await datPhongService.checkAvailability({
        roomId: values.maPhong,
        checkInDateTime: values.dateRange[0].format('YYYY-MM-DD'),
        checkOutDateTime: values.dateRange[1].format('YYYY-MM-DD'),
      });
      setAvailabilityResult(result);
      setAvailabilityModalVisible(true);
    } catch (error) {
      message.error('Lỗi khi kiểm tra tính khả dụng!');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        ngayNhan: values.dateRange[0].format('YYYY-MM-DD'),
        ngayTra: values.dateRange[1].format('YYYY-MM-DD'),
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
      title: 'Loại đặt',
      dataIndex: 'loaiDat',
      key: 'loaiDat',
      render: (type: string) => {
        const color = type === 'Theo giờ' ? 'blue' : type === 'Qua đêm' ? 'green' : 'orange';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Ngày nhận',
      dataIndex: 'ngayNhan',
      key: 'ngayNhan',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày trả',
      dataIndex: 'ngayTra',
      key: 'ngayTra',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'tongTienSauGiam',
      key: 'tongTienSauGiam',
      render: (amount: number) => `${amount?.toLocaleString() || 0} VNĐ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (status: string, record: DatPhong) => {
        return (
          <Select
            value={status}
            style={{ width: 150 }}
            onChange={(newStatus) => handleStatusUpdate(record.maDatPhong, newStatus)}
          >
            <Select.Option value="Chờ xác nhận thanh toán">Chờ xác nhận thanh toán</Select.Option>
            <Select.Option value="Đã xác nhận">Đã xác nhận</Select.Option>
            <Select.Option value="Đã hủy">Đã hủy</Select.Option>
            <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
          </Select>
        );
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
        footer={[
          <Button key="check" onClick={() => form.validateFields().then(handleCheckAvailability)}>
            Kiểm tra khả dụng
          </Button>,
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {editingBooking ? 'Cập nhật' : 'Thêm mới'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Khách hàng"
            name="maND"
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
            label="Loại đặt phòng"
            name="loaiDat"
            rules={[{ required: true, message: 'Vui lòng chọn loại đặt phòng!' }]}
          >
            <Select>
              <Select.Option value="Theo giờ">Theo giờ</Select.Option>
              <Select.Option value="Qua đêm">Qua đêm</Select.Option>
              <Select.Option value="Theo ngày">Theo ngày</Select.Option>
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
            label="Số giờ (nếu đặt theo giờ)"
            name="soGio"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Số ngày (nếu đặt theo ngày)"
            name="soNgay"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Tổng tiền gốc"
            name="tongTienGoc"
            rules={[{ required: true, message: 'Vui lòng nhập tổng tiền gốc!' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0 as any}
            />
          </Form.Item>

          <Form.Item
            label="Tổng tiền sau giảm"
            name="tongTienSauGiam"
            rules={[{ required: true, message: 'Vui lòng nhập tổng tiền sau giảm!' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0 as any}
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
              <Select.Option value="Chờ xác nhận thanh toán">Chờ xác nhận thanh toán</Select.Option>
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
            <p><strong>Loại đặt phòng:</strong> <Tag color={selectedBooking.loaiDat === 'Theo giờ' ? 'blue' : selectedBooking.loaiDat === 'Qua đêm' ? 'green' : 'orange'}>{selectedBooking.loaiDat}</Tag></p>
            <p><strong>Ngày đặt:</strong> {dayjs(selectedBooking.ngayDat).format('DD/MM/YYYY HH:mm')}</p>
            <p><strong>Ngày nhận phòng:</strong> {dayjs(selectedBooking.ngayNhan).format('DD/MM/YYYY')}</p>
            <p><strong>Ngày trả phòng:</strong> {dayjs(selectedBooking.ngayTra).format('DD/MM/YYYY')}</p>
            <p><strong>Số người lớn:</strong> {selectedBooking.soNguoiLon}</p>
            <p><strong>Số trẻ em:</strong> {selectedBooking.soTreEm}</p>
            {selectedBooking.soGio && <p><strong>Số giờ:</strong> {selectedBooking.soGio}</p>}
            {selectedBooking.soNgay && <p><strong>Số ngày:</strong> {selectedBooking.soNgay}</p>}
            <p><strong>Tổng tiền gốc:</strong> {selectedBooking.tongTienGoc?.toLocaleString() || 0} VNĐ</p>
            <p><strong>Tổng tiền sau giảm:</strong> {selectedBooking.tongTienSauGiam?.toLocaleString() || 0} VNĐ</p>
            <p><strong>Trạng thái:</strong> <Tag color={selectedBooking.trangThai === 'Đã xác nhận' ? 'green' : 'orange'}>{selectedBooking.trangThai}</Tag></p>
            {selectedBooking.ghiChu && <p><strong>Ghi chú:</strong> {selectedBooking.ghiChu}</p>}
          </div>
        )}
      </Modal>

      <Modal
        title="Kết quả kiểm tra khả dụng"
        open={availabilityModalVisible}
        onCancel={() => setAvailabilityModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setAvailabilityModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {availabilityResult && (
          <div>
            <p><strong>Trạng thái:</strong> 
              <Tag color={availabilityResult.available ? 'green' : 'red'}>
                {availabilityResult.available ? 'Có sẵn' : 'Không có sẵn'}
              </Tag>
            </p>
            <p><strong>Thông báo:</strong> {availabilityResult.message}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingManagement;

