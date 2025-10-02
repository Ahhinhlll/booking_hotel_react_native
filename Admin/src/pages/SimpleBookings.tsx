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
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from '@mui/material';
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { Visibility, FilterList } from '@mui/icons-material';
import type { DatPhong } from '../types';
import { bookingService } from '../services/bookingService';

const SimpleBookings: React.FC = () => {
  const [bookings, setBookings] = useState<DatPhong[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<DatPhong | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getAllBookings();
      // Ensure data is array
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]); // Set empty array on error
      setSnackbar({ 
        open: true, 
        message: 'Lỗi khi tải danh sách đặt phòng', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (booking: DatPhong) => {
    setSelectedBooking(booking);
    setOpenDetail(true);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Đã xác nhận': return 'success';
      case 'Chờ xử lý': return 'warning';
      case 'Đã hủy': return 'error';
      case 'Hoàn thành': return 'info';
      case 'Đã thanh toán': return 'primary';
      default: return 'default';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
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
      field: 'customerName',
      headerName: 'Khách hàng',
      width: 200,
      valueGetter: (params) => params.row.NguoiDung?.hoTen || 'N/A',
    },
    {
      field: 'hotelName',
      headerName: 'Khách sạn',
      width: 200,
      valueGetter: (params) => params.row.KhachSan?.tenKS || 'N/A',
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
      field: 'tongTienSauGiam',
      headerName: 'Tổng tiền',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          {formatPrice(params.value)}
        </Typography>
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
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Thao tác',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<Visibility />}
          label="Xem"
          onClick={() => handleView(params.row)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
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

      <Box sx={{ height: 600, width: '100%' }}>
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
      </Box>

      {/* Booking Detail Dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết đặt phòng</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Mã đặt phòng: {selectedBooking.maDatPhong}
              </Typography>
              <Typography variant="body1" paragraph>
                Khách hàng: {selectedBooking.NguoiDung?.hoTen}
              </Typography>
              <Typography variant="body1" paragraph>
                Khách sạn: {selectedBooking.KhachSan?.tenKS}
              </Typography>
              <Typography variant="body1" paragraph>
                Loại đặt: {selectedBooking.loaiDat}
              </Typography>
              <Typography variant="body1" paragraph>
                Trạng thái: {selectedBooking.trangThai}
              </Typography>
              <Typography variant="body1" paragraph>
                Tổng tiền: {formatPrice(selectedBooking.tongTienSauGiam)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

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

export default SimpleBookings;
