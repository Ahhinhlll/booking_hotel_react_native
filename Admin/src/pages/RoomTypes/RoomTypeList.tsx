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
  Alert,
  Snackbar,
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
} from '@mui/icons-material';
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import type { LoaiPhong } from '../../types';
import apiClient from '../../services/api';

const RoomTypeList: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<LoaiPhong[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<LoaiPhong | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [formData, setFormData] = useState({ tenLoaiPhong: '', moTa: '', trangThai: 'Hoạt động' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadRoomTypes();
  }, []);

  const loadRoomTypes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/loaiphong/getall');
      setRoomTypes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading room types:', error);
      setRoomTypes([]);
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách loại phòng', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedType(null);
    setFormData({ tenLoaiPhong: '', moTa: '', trangThai: 'Hoạt động' });
    setOpenForm(true);
  };

  const handleEdit = (type: LoaiPhong) => {
    setSelectedType(type);
    setFormData({
      tenLoaiPhong: type.tenLoaiPhong,
      moTa: type.moTa || '',
      trangThai: type.trangThai || 'Hoạt động',
    });
    setOpenForm(true);
  };

  const handleDelete = (type: LoaiPhong) => {
    setSelectedType(type);
    setOpenDelete(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedType) {
        await apiClient.put(`/loaiphong/${selectedType.maLoaiPhong}`, formData);
        setSnackbar({ open: true, message: 'Cập nhật thành công', severity: 'success' });
      } else {
        await apiClient.post('/loaiphong', formData);
        setSnackbar({ open: true, message: 'Thêm mới thành công', severity: 'success' });
      }
      setOpenForm(false);
      loadRoomTypes();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Có lỗi xảy ra', severity: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (selectedType) {
      try {
        await apiClient.delete(`/loaiphong/${selectedType.maLoaiPhong}`);
        setSnackbar({ open: true, message: 'Xóa thành công', severity: 'success' });
        loadRoomTypes();
      } catch (error: any) {
        setSnackbar({ open: true, message: error.response?.data?.message || 'Lỗi khi xóa', severity: 'error' });
      }
    }
    setOpenDelete(false);
  };

  const columns: GridColDef[] = [
    {
      field: 'tenLoaiPhong',
      headerName: 'Tên loại phòng',
      width: 250,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'moTa',
      headerName: 'Mô tả',
      width: 400,
      renderCell: (params) => params.value || 'Chưa có mô tả',
    },
    {
      field: 'trangThai',
      headerName: 'Trạng thái',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Hoạt động' ? 'success' : 'error'}
          size="small"
          icon={params.value === 'Hoạt động' ? <CheckCircle /> : <Block />}
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
          key="edit"
          icon={<Edit />}
          label="Sửa"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
          label="Xóa"
          onClick={() => handleDelete(params.row)}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Quản lý Loại Phòng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý các loại phòng trong hệ thống
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd} size="large">
          Thêm loại phòng
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={roomTypes}
          columns={columns}
          getRowId={(row) => row.maLoaiPhong}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedType ? 'Chỉnh sửa loại phòng' : 'Thêm loại phòng mới'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <input
              type="text"
              placeholder="Tên loại phòng *"
              value={formData.tenLoaiPhong}
              onChange={(e) => setFormData({ ...formData, tenLoaiPhong: e.target.value })}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <textarea
              placeholder="Mô tả"
              value={formData.moTa}
              onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
              rows={4}
              style={{ width: '100%', padding: '12px', marginBottom: '16px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <select
              value={formData.trangThai}
              onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
              style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="Hoạt động">Hoạt động</option>
              <option value="Khóa">Khóa</option>
            </select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedType ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa loại phòng "{selectedType?.tenLoaiPhong}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Xóa</Button>
        </DialogActions>
      </Dialog>

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

export default RoomTypeList;

