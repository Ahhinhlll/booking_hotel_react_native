import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { 
  UserOutlined, 
  HomeOutlined, 
  CalendarOutlined, 
  DollarOutlined 
} from '@ant-design/icons';
import { datPhongService } from '../services/datPhongService';
import { nguoiDungService } from '../services/nguoiDungService';
import { khachSanService } from '../services/khachSanService';
import { DatPhong } from '../types';
import dayjs from 'dayjs';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<DatPhong[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [users, hotels, bookings] = await Promise.all([
        nguoiDungService.getAll(),
        khachSanService.getAll(),
        datPhongService.getAll(),
      ]);

      const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.tongTien || 0), 0);

      setStats({
        totalUsers: users.length,
        totalHotels: hotels.length,
        totalBookings: bookings.length,
        totalRevenue,
      });

      // Lấy 10 booking gần nhất
      const sorted = [...bookings].sort((a, b) => 
        new Date(b.ngayDat).getTime() - new Date(a.ngayDat).getTime()
      );
      setRecentBookings(sorted.slice(0, 10));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã Đặt Phòng',
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
      title: 'Ngày đặt',
      dataIndex: 'ngayDat',
      key: 'ngayDat',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
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
        const color = status === 'Đã xác nhận' ? 'green' : 
                     status === 'Chờ xác nhận' ? 'orange' : 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Dashboard</h1>
      
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Người dùng"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Khách sạn"
              value={stats.totalHotels}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Đặt phòng"
              value={stats.totalBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Đặt phòng gần đây" loading={loading}>
        <Table
          columns={columns}
          dataSource={recentBookings}
          rowKey="maDatPhong"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;

