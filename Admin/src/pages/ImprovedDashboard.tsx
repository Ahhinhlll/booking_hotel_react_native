import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  IconButton,
  Avatar,
  AvatarGroup,
  Chip,
  LinearProgress,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import Grid from '../components/common/Grid';
import {
  People,
  Hotel,
  MeetingRoom,
  BookOnline,
  TrendingUp,
  TrendingDown,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Refresh,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Data mẫu
const monthlyRevenue = [
  { month: 'T1', revenue: 125000000, bookings: 45 },
  { month: 'T2', revenue: 135000000, bookings: 52 },
  { month: 'T3', revenue: 148000000, bookings: 58 },
  { month: 'T4', revenue: 162000000, bookings: 65 },
  { month: 'T5', revenue: 155000000, bookings: 60 },
  { month: 'T6', revenue: 178000000, bookings: 72 },
  { month: 'T7', revenue: 192000000, bookings: 80 },
];

const roomTypeData = [
  { name: 'Standard', value: 35, color: '#3b82f6' },
  { name: 'Deluxe', value: 28, color: '#8b5cf6' },
  { name: 'Suite', value: 22, color: '#ec4899' },
  { name: 'VIP', value: 15, color: '#f59e0b' },
];

const recentBookings = [
  {
    id: 1,
    customer: 'Nguyễn Văn A',
    hotel: 'Grand Hotel',
    room: 'Deluxe 101',
    status: 'confirmed',
    amount: 2500000,
    date: '2025-10-02',
  },
  {
    id: 2,
    customer: 'Trần Thị B',
    hotel: 'Ocean View',
    room: 'Suite 205',
    status: 'pending',
    amount: 4500000,
    date: '2025-10-03',
  },
  {
    id: 3,
    customer: 'Lê Văn C',
    hotel: 'City Center',
    room: 'Standard 302',
    status: 'confirmed',
    amount: 1800000,
    date: '2025-10-02',
  },
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  trend: number;
  trendLabel: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendLabel, color }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
            {value}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            {trend >= 0 ? (
              <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography
              variant="body2"
              color={trend >= 0 ? 'success.main' : 'error.main'}
              fontWeight={600}
            >
              {Math.abs(trend)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {trendLabel}
            </Typography>
          </Box>
        </Box>
        <Avatar
          sx={{
            bgcolor: color,
            width: 56,
            height: 56,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const ImprovedDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 800);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <LinearProgress sx={{ width: 300 }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng quan hệ thống quản lý khách sạn
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => window.location.reload()}
        >
          Làm mới
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Tổng người dùng"
            value="2,543"
            icon={<People />}
            trend={12.5}
            trendLabel="so với tháng trước"
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Khách sạn"
            value="48"
            icon={<Hotel />}
            trend={8.2}
            trendLabel="so với tháng trước"
            color="#8b5cf6"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Đặt phòng"
            value="328"
            icon={<BookOnline />}
            trend={-3.1}
            trendLabel="so với tháng trước"
            color="#ec4899"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Doanh thu"
            value="192M"
            icon={<TrendingUp />}
            trend={15.3}
            trendLabel="so với tháng trước"
            color="#f59e0b"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Doanh thu & Đặt phòng
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thống kê 7 tháng gần nhất
                  </Typography>
                </Box>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Room Type Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Phân bố loại phòng
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Tỷ lệ đặt phòng theo loại
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roomTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={(entry) => `${entry.value}%`}
                  >
                    {roomTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box mt={2}>
                <Stack spacing={1}>
                  {roomTypeData.map((item) => (
                    <Box
                      key={item.name}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: item.color,
                          }}
                        />
                        <Typography variant="body2">{item.name}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.value}%
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Đặt phòng gần đây
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Danh sách đặt phòng mới nhất
                  </Typography>
                </Box>
                <Button size="small">Xem tất cả</Button>
              </Box>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                        Khách hàng
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                        Khách sạn
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                        Phòng
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                        Ngày đặt
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                        Trạng thái
                      </th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                        Số tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        style={{ borderBottom: '1px solid #f0f0f0' }}
                      >
                        <td style={{ padding: '16px' }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {booking.customer.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>
                              {booking.customer}
                            </Typography>
                          </Box>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <Typography variant="body2">{booking.hotel}</Typography>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <Typography variant="body2">{booking.room}</Typography>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(booking.date).toLocaleDateString('vi-VN')}
                          </Typography>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <Chip
                            label={getStatusLabel(booking.status)}
                            color={getStatusColor(booking.status)}
                            size="small"
                          />
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(booking.amount)}
                          </Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Tỷ lệ lấp đầy
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="primary" my={2}>
                82%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={82}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                328/400 phòng đã được đặt
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Đánh giá TB
              </Typography>
              <Box display="flex" alignItems="baseline" gap={1} my={2}>
                <Typography variant="h3" fontWeight="bold" color="warning.main">
                  4.8
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  / 5.0
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Từ 1,234 đánh giá
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Check-in hôm nay
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="success.main" my={2}>
                45
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Khách sẽ đến trong hôm nay
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Check-out hôm nay
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="info.main" my={2}>
                38
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Khách sẽ trả phòng hôm nay
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImprovedDashboard;

