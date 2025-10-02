import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  People,
  Hotel,
  MeetingRoom,
  BookOnline,
  TrendingUp,
  Person,
  CheckCircle,
  Cancel,
  Schedule,
} from '@mui/icons-material';
import {
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
} from 'recharts';
import Grid from '../components/common/Grid';

// Mock data for charts
const bookingData = [
  { month: 'T1', bookings: 65 },
  { month: 'T2', bookings: 59 },
  { month: 'T3', bookings: 80 },
  { month: 'T4', bookings: 81 },
  { month: 'T5', bookings: 56 },
  { month: 'T6', bookings: 55 },
];

const statusData = [
  { name: 'Đã xác nhận', value: 400, color: '#4caf50' },
  { name: 'Chờ xử lý', value: 300, color: '#ff9800' },
  { name: 'Đã hủy', value: 200, color: '#f44336' },
  { name: 'Hoàn thành', value: 100, color: '#2196f3' },
];

const recentBookings = [
  {
    id: '1',
    customerName: 'Nguyễn Văn A',
    hotelName: 'Khách sạn ABC',
    status: 'Chờ xử lý',
    amount: '2,500,000 VNĐ',
    date: '2024-01-15',
  },
  {
    id: '2',
    customerName: 'Trần Thị B',
    hotelName: 'Resort XYZ',
    status: 'Đã xác nhận',
    amount: '3,200,000 VNĐ',
    date: '2024-01-14',
  },
  {
    id: '3',
    customerName: 'Lê Văn C',
    hotelName: 'Hotel 5 sao',
    status: 'Hoàn thành',
    amount: '4,800,000 VNĐ',
    date: '2024-01-13',
  },
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
  change?: string;
  trend?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, change, trend }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          {change && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUp
                sx={{
                  color: trend === 'up' ? 'success.main' : 'error.main',
                  fontSize: 16,
                  mr: 0.5,
                }}
              />
              <Typography
                variant="body2"
                color={trend === 'up' ? 'success.main' : 'error.main'}
              >
                {change}
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return 'success';
      case 'Chờ xử lý':
        return 'warning';
      case 'Đã hủy':
        return 'error';
      case 'Hoàn thành':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return <CheckCircle />;
      case 'Chờ xử lý':
        return <Schedule />;
      case 'Đã hủy':
        return <Cancel />;
      case 'Hoàn thành':
        return <CheckCircle />;
      default:
        return <Schedule />;
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Tổng quan hệ thống quản lý khách sạn
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng người dùng"
            value="1,234"
            icon={<People />}
            color="#1976d2"
            change="+12%"
            trend="up"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Khách sạn"
            value="45"
            icon={<Hotel />}
            color="#388e3c"
            change="+3%"
            trend="up"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Phòng"
            value="892"
            icon={<MeetingRoom />}
            color="#f57c00"
            change="+8%"
            trend="up"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đặt phòng tháng này"
            value="156"
            icon={<BookOnline />}
            color="#7b1fa2"
            change="-5%"
            trend="down"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Booking Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê đặt phòng theo tháng
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Trạng thái đặt phòng
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Đặt phòng gần đây
            </Typography>
            <List>
              {recentBookings.map((booking, index) => (
                <ListItem key={booking.id} divider={index < recentBookings.length - 1}>
                  <ListItemAvatar>
                    <Avatar>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="subtitle1">{booking.customerName}</Typography>
                        <Chip
                          icon={getStatusIcon(booking.status)}
                          label={booking.status}
                          color={getStatusColor(booking.status) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {booking.hotelName} • {booking.amount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.date}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
