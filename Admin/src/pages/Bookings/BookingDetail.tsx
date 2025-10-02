import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import Grid from '../../components/common/Grid';
import {
  Person,
  Hotel,
  MeetingRoom,
  CalendarToday,
  LocalOffer,
  People,
  ChildCare,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';
import type { DatPhong } from '../../types';
import { bookingService } from '../../services/bookingService';

interface BookingDetailProps {
  booking: DatPhong;
  onStatusUpdate?: () => void;
}

const BookingDetail: React.FC<BookingDetailProps> = ({ booking, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(booking.trangThai || '');

  const handleStatusUpdate = async () => {
    if (newStatus === booking.trangThai) return;

    try {
      setLoading(true);
      await bookingService.updateBookingStatus(booking.maDatPhong, newStatus);
      onStatusUpdate?.();
    } catch (error) {
      console.error('Error updating booking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return 'success';
      case 'Chờ xử lý':
        return 'warning';
      case 'Đã hủy':
        return 'error';
      case 'Hoàn thành':
        return 'info';
      case 'Đã thanh toán':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Chưa xác định';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) return 'Chưa xác định';
    return new Date(date).toLocaleString('vi-VN');
  };

  const statusOptions = [
    { value: 'Chờ xử lý', label: 'Chờ xử lý' },
    { value: 'Đã xác nhận', label: 'Đã xác nhận' },
    { value: 'Đã thanh toán', label: 'Đã thanh toán' },
    { value: 'Hoàn thành', label: 'Hoàn thành' },
    { value: 'Đã hủy', label: 'Đã hủy' },
  ];

  return (
    <Box>
      {/* Booking Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Đặt phòng #{booking.maDatPhong.slice(0, 8)}...
            </Typography>
            <Chip
              label={booking.trangThai}
              color={getStatusColor(booking.trangThai)}
              size="medium"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Ngày đặt: {formatDateTime(booking.ngayDat)}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Person />
                </Avatar>
                <Typography variant="h6">Thông tin khách hàng</Typography>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Họ tên"
                    secondary={booking.NguoiDung?.hoTen || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={booking.NguoiDung?.email || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Số điện thoại"
                    secondary={booking.NguoiDung?.sdt || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Địa chỉ"
                    secondary={booking.NguoiDung?.diaChi || 'Chưa cập nhật'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Hotel Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <Hotel />
                </Avatar>
                <Typography variant="h6">Thông tin khách sạn</Typography>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Tên khách sạn"
                    secondary={booking.KhachSan?.tenKS || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Địa chỉ"
                    secondary={booking.KhachSan?.diaChi || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Số điện thoại"
                    secondary={booking.KhachSan?.dienThoai || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Phòng"
                    secondary={booking.Phong?.tenPhong || `Phòng ${booking.maPhong.slice(0, 8)}`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Details */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Chi tiết đặt phòng
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <MeetingRoom />
                      </ListItemIcon>
                      <ListItemText
                        primary="Loại đặt"
                        secondary={booking.loaiDat}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday />
                      </ListItemIcon>
                      <ListItemText
                        primary="Ngày nhận phòng"
                        secondary={formatDate(booking.ngayNhan)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday />
                      </ListItemIcon>
                      <ListItemText
                        primary="Ngày trả phòng"
                        secondary={formatDate(booking.ngayTra)}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <People />
                      </ListItemIcon>
                      <ListItemText
                        primary="Số người lớn"
                        secondary={booking.soNguoiLon || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ChildCare />
                      </ListItemIcon>
                      <ListItemText
                        primary="Số trẻ em"
                        secondary={booking.soTreEm || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule />
                      </ListItemIcon>
                      <ListItemText
                        primary={booking.loaiDat === 'Theo giờ' ? 'Số giờ' : 'Số ngày'}
                        secondary={booking.loaiDat === 'Theo giờ' ? booking.soGio : booking.soNgay}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin thanh toán
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Tổng tiền gốc:</Typography>
                    <Typography fontWeight="bold">
                      {formatPrice(booking.tongTienGoc)}
                    </Typography>
                  </Box>
                  {booking.maKM && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography color="success.main">
                        <LocalOffer sx={{ fontSize: 16, mr: 0.5 }} />
                        Khuyến mãi:
                      </Typography>
                      <Typography color="success.main">
                        -{formatPrice((booking.tongTienGoc || 0) - (booking.tongTienSauGiam || 0))}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">Tổng thanh toán:</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {formatPrice(booking.tongTienSauGiam)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  {booking.ghiChu && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Ghi chú:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.ghiChu}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Update */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cập nhật trạng thái
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={newStatus}
                    label="Trạng thái"
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleStatusUpdate}
                  disabled={loading || newStatus === booking.trangThai}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                >
                  Cập nhật
                </Button>
              </Box>
              {newStatus !== booking.trangThai && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Trạng thái sẽ được thay đổi từ "{booking.trangThai}" thành "{newStatus}"
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingDetail;
