import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocalOffer,
} from '@mui/icons-material';
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import type { KhuyenMai } from '../../types';
import apiClient from '../../services/api';

const PromotionList: React.FC = () => {
  const [promotions, setPromotions] = useState<KhuyenMai[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/khuyenmai');
      setPromotions(response.data);
    } catch (error) {
      console.error('Error loading promotions:', error);
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách khuyến mãi', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Hoạt động' ? 'success' : 'error';
  };

  const isActivePromotion = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  const columns: GridColDef[] = [
    {
      field: 'tenKM',
      headerName: 'Tên khuyến mãi',
      width: 250,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <LocalOffer color="primary" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'moTa',
      headerName: 'Mô tả',
      width: 300,
    },
    {
      field: 'phanTramGiam',
      headerName: 'Giảm giá',
      width: 120,
      renderCell: (params) => (
        <Chip label={`${params.value}%`} color="error" size="small" />
      ),
    },
    {
      field: 'ngayBatDau',
      headerName: 'Ngày bắt đầu',
      width: 130,
      renderCell: (params) => new Date(params.value).toLocaleDateString('vi-VN'),
    },
    {
      field: 'ngayKetThuc',
      headerName: 'Ngày kết thúc',
      width: 130,
      renderCell: (params) => new Date(params.value).toLocaleDateString('vi-VN'),
    },
    {
      field: 'trangThai',
      headerName: 'Trạng thái',
      width: 150,
      renderCell: (params) => {
        const isActive = isActivePromotion(params.row.ngayBatDau, params.row.ngayKetThuc);
        return (
          <Chip
            label={isActive ? 'Đang hoạt động' : 'Hết hạn'}
            color={isActive ? 'success' : 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Thao tác',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          label="Sửa"
          onClick={() => {}}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
          label="Xóa"
          onClick={() => {}}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Quản lý Khuyến Mãi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý các chương trình khuyến mãi
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} size="large">
          Thêm khuyến mãi
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={promotions}
          columns={columns}
          getRowId={(row) => row.maKM}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

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

export default PromotionList;

