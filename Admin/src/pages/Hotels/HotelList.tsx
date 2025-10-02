import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Rating,
  Menu,
  MenuItem,
  ListItemIcon,
  Alert,
  Snackbar,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
} from '@mui/material';
import Grid from '../../components/common/Grid';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Star,
  LocationOn,
  Phone,
  Visibility,
  CheckCircle,
  Block,
} from '@mui/icons-material';
import type { KhachSan } from '../../types';
import { hotelService } from '../../services/hotelService';
// import HotelForm from './HotelForm';

const HotelList: React.FC = () => {
  const [hotels, setHotels] = useState<KhachSan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<KhachSan | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const data = await hotelService.getAllHotels();
      setHotels(data);
    } catch (error) {
      console.error('Error loading hotels:', error);
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách khách sạn', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedHotel(null);
    setOpenForm(true);
  };

  const handleEdit = (hotel: KhachSan) => {
    setSelectedHotel(hotel);
    setOpenForm(true);
  };

  const handleDelete = (hotel: KhachSan) => {
    setSelectedHotel(hotel);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (selectedHotel) {
      try {
        await hotelService.deleteHotel(selectedHotel.maKS);
        setSnackbar({ open: true, message: 'Xóa khách sạn thành công', severity: 'success' });
        loadHotels();
      } catch (error) {
        console.error('Error deleting hotel:', error);
        setSnackbar({ open: true, message: 'Lỗi khi xóa khách sạn', severity: 'error' });
      }
    }
    setOpenDelete(false);
    setSelectedHotel(null);
  };

  const handleStatusChange = async (hotel: KhachSan, newStatus: string) => {
    try {
      await hotelService.updateHotelStatus(hotel.maKS, newStatus);
      setSnackbar({ open: true, message: 'Cập nhật trạng thái thành công', severity: 'success' });
      loadHotels();
    } catch (error) {
      console.error('Error updating hotel status:', error);
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật trạng thái', severity: 'error' });
    }
    setAnchorEl(null);
  };


  const getStatusColor = (status: string) => {
    return status === 'Hoạt động' ? 'success' : 'error';
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Chưa cập nhật';
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
            Quản lý khách sạn
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý thông tin khách sạn trong hệ thống
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          size="large"
        >
          Thêm khách sạn
        </Button>
      </Box>

      <Grid container spacing={3}>
        {hotels.map((hotel) => (
          <Grid item xs={12} sm={6} md={4} key={hotel.maKS}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={hotel.anh?.[0] || '/placeholder-hotel.jpg'}
                alt={hotel.tenKS}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography gutterBottom variant="h6" component="div" noWrap>
                    {hotel.tenKS}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      setSelectedHotel(hotel);
                      setAnchorEl(event.currentTarget);
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <Rating value={hotel.hangSao} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({hotel.diemDanhGia}/10)
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {hotel.diaChi}
                  </Typography>
                </Box>

                {hotel.dienThoai && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <Phone sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {hotel.dienThoai}
                    </Typography>
                  </Box>
                )}

                <Typography variant="body2" color="text.secondary" mb={1}>
                  Giá từ: <strong>{formatPrice(hotel.giaThapNhat)}</strong>
                </Typography>

                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    label={hotel.trangThai}
                    color={getStatusColor(hotel.trangThai)}
                    size="small"
                  />
                  {hotel.noiBat === 'Nổi bật' && (
                    <Chip
                      label="Nổi bật"
                      color="warning"
                      size="small"
                      icon={<Star />}
                    />
                  )}
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => handleEdit(hotel)}
                >
                  Xem
                </Button>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => handleEdit(hotel)}
                >
                  Sửa
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Hotel Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedHotel ? 'Chỉnh sửa khách sạn' : 'Thêm khách sạn mới'}
        </DialogTitle>
        <DialogContent>
          <div>HotelForm component - Coming Soon</div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa khách sạn "{selectedHotel?.tenKS}"?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleEdit(selectedHotel!)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Chỉnh sửa
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleStatusChange(
              selectedHotel!,
              selectedHotel?.trangThai === 'Hoạt động' ? 'Khóa' : 'Hoạt động'
            )
          }
        >
          <ListItemIcon>
            {selectedHotel?.trangThai === 'Hoạt động' ? (
              <Block fontSize="small" />
            ) : (
              <CheckCircle fontSize="small" />
            )}
          </ListItemIcon>
          {selectedHotel?.trangThai === 'Hoạt động' ? 'Khóa' : 'Kích hoạt'}
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedHotel!)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          Xóa
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HotelList;
