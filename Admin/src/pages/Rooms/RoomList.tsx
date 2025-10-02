import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  CheckCircle,
  Block,
  Hotel,
} from '@mui/icons-material';
import Grid from '../../components/common/Grid';
import type { Phong } from '../../types';
import apiClient from '../../services/api';

const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Phong | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/phong');
      setRooms(response.data);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách phòng', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (room: Phong, newStatus: string) => {
    try {
      await apiClient.put(`/phong/${room.maPhong}`, { trangThai: newStatus });
      setSnackbar({ open: true, message: 'Cập nhật trạng thái thành công', severity: 'success' });
      loadRooms();
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật trạng thái', severity: 'error' });
    }
    setAnchorEl(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Trống':
        return 'success';
      case 'Đang sử dụng':
        return 'error';
      case 'Đang dọn':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Quản lý Phòng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý các phòng trong hệ thống
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} size="large">
          Thêm phòng
        </Button>
      </Box>

      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room.maPhong}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={room.anh?.[0] || '/placeholder-room.jpg'}
                alt={room.tenPhong}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="h6" component="div">
                    {room.tenPhong || 'Phòng'}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setSelectedRoom(room);
                      setAnchorEl(e.currentTarget);
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Loại: {room.LoaiPhong?.tenLoaiPhong}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Khách sạn: {room.KhachSan?.tenKS}
                </Typography>

                {room.dienTich && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Diện tích: {room.dienTich}
                  </Typography>
                )}

                <Typography variant="h6" color="primary" mt={1}>
                  {formatPrice(room.gia)}
                </Typography>

                <Box mt={2}>
                  <Chip
                    label={room.trangThai}
                    color={getStatusColor(room.trangThai)}
                    size="small"
                    icon={room.trangThai === 'Trống' ? <CheckCircle /> : <Block />}
                  />
                </Box>
              </CardContent>

              <CardActions>
                <Button size="small" startIcon={<Edit />}>
                  Sửa
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleStatusChange(selectedRoom!, 'Trống')}>
          <ListItemIcon>
            <CheckCircle fontSize="small" />
          </ListItemIcon>
          Đánh dấu trống
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedRoom!, 'Đang sử dụng')}>
          <ListItemIcon>
            <Block fontSize="small" />
          </ListItemIcon>
          Đánh dấu đang sử dụng
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange(selectedRoom!, 'Đang dọn')}>
          <ListItemIcon>
            <Hotel fontSize="small" />
          </ListItemIcon>
          Đánh dấu đang dọn
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoomList;

