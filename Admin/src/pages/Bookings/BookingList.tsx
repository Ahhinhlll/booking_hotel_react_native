import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  Alert,
  Snackbar,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import {
  MoreVert,
  Person,
  CheckCircle,
  Cancel,
  Schedule,
  Payment,
  Visibility,
  FilterList,
} from '@mui/icons-material';
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import type { DatPhong } from '../../types';
import { bookingService } from '../../services/bookingService';
import BookingDetail from './BookingDetail';

const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<DatPhong[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<DatPhong | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách đặt phòng', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (booking: DatPhong) => {
    setSelectedBooking(booking);
    setOpenDetail(true);
  };

  const handleStatusChange = async (booking: DatPhong, newStatus: string) => {
    try {
      await bookingService.updateBookingStatus(booking.maDatPhong, newStatus);
      setSnackbar({ open: true, message: 'Cập nhật trạng thái thành công', severity: 'success' });
      loadBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật trạng thái', severity: 'error' });
    }
    setAnchorEl(null);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
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

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return <CheckCircle />;
      case 'Chờ xử lý':
        return <Schedule />;
      case 'Đã hủy':
        return <Cancel />;
      case 'Hoàn thành':
        return <CheckCircle />;
      case 'Đã thanh toán':
        return <Payment />;
      default:
        return <Schedule />;
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Chưa xác định';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true;
    return booking.trangThai === statusFilter;
  });

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Chờ xử lý', label: 'Chờ xử lý' },
    { value: 'Đã xác nhận', label: 'Đã xác nhận' },
    { value: 'Đã thanh toán', label: 'Đã thanh toán' },
    { value: 'Hoàn thành', label: 'Hoàn thành' },
    { value: 'Đã hủy', label: 'Đã hủy' },
  ];

  const columns: GridColDef[] = [
    {
      field: 'maDatPhong',
      headerName: 'Mã đặt phòng',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace">
          {params.value.slice(0, 8)}...
        </Typography>
      ),
    },
    {
      field: 'customer',
      headerName: 'Khách hàng',
      width: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.NguoiDung?.hoTen || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.NguoiDung?.email || 'N/A'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'hotel',
      headerName: 'Khách sạn',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.KhachSan?.tenKS || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.KhachSan?.diaChi || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'loaiDat',
      headerName: 'Loại đặt',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Theo ngày' ? 'primary' : 'secondary'}
          size="small"
        />
      ),
    },
    {
      field: 'ngayNhan',
      headerName: 'Ngày nhận',
      width: 120,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: 'ngayTra',
      headerName: 'Ngày trả',
      width: 120,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: 'tongTienSauGiam',
      headerName: 'Tổng tiền',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold" color="primary">
            {formatPrice(params.value)}
          </Typography>
          {params.row.tongTienGoc !== params.value && (
            <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              {formatPrice(params.row.tongTienGoc)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'trangThai',
      headerName: 'Trạng thái',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          icon={getStatusIcon(params.value)}
        />
      ),
    },
    {
      field: 'ngayDat',
      headerName: 'Ngày đặt',
      width: 120,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Thao tác',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="Xem"
          onClick={() => handleView(params.row)}
        />,
        <GridActionsCellItem
          icon={<MoreVert />}
          label="Thêm"
          onClick={(event) => {
            setSelectedBooking(params.row);
            setAnchorEl(event.currentTarget as HTMLElement);
          }}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Quản lý đặt phòng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi và quản lý các đơn đặt phòng
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Lọc theo trạng thái</InputLabel>
          <Select
            value={statusFilter}
            label="Lọc theo trạng thái"
            onChange={handleFilterChange}
            startAdornment={<FilterList sx={{ mr: 1 }} />}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredBookings}
          columns={columns}
          getRowId={(row) => row.maDatPhong}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Booking Detail Dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết đặt phòng</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <BookingDetail
              booking={selectedBooking}
              onStatusUpdate={async () => {
                await loadBookings();
                setOpenDetail(false);
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleView(selectedBooking!)}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          Xem chi tiết
        </MenuItem>
        {selectedBooking?.trangThai === 'Chờ xử lý' && (
          <MenuItem onClick={() => handleStatusChange(selectedBooking!, 'Đã xác nhận')}>
            <ListItemIcon>
              <CheckCircle fontSize="small" />
            </ListItemIcon>
            Xác nhận
          </MenuItem>
        )}
        {selectedBooking?.trangThai === 'Đã xác nhận' && (
          <MenuItem onClick={() => handleStatusChange(selectedBooking!, 'Đã thanh toán')}>
            <ListItemIcon>
              <Payment fontSize="small" />
            </ListItemIcon>
            Đánh dấu đã thanh toán
          </MenuItem>
        )}
        {selectedBooking?.trangThai !== 'Đã hủy' && selectedBooking?.trangThai !== 'Hoàn thành' && (
          <MenuItem
            onClick={() => handleStatusChange(selectedBooking!, 'Đã hủy')}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Cancel fontSize="small" color="error" />
            </ListItemIcon>
            Hủy đặt phòng
          </MenuItem>
        )}
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

export default BookingList;
