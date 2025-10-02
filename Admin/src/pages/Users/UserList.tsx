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
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Person,
  Block,
  CheckCircle,
  Visibility,
} from '@mui/icons-material';
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import type { User } from '../../types';
import { userService } from '../../services/userService';
import UserForm from './UserForm';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách người dùng', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setOpenForm(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await userService.deleteUser(selectedUser.maNguoiDung);
        setSnackbar({ open: true, message: 'Xóa người dùng thành công', severity: 'success' });
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        setSnackbar({ open: true, message: 'Lỗi khi xóa người dùng', severity: 'error' });
      }
    }
    setOpenDelete(false);
    setSelectedUser(null);
  };

  const handleStatusChange = async (user: User, newStatus: string) => {
    try {
      await userService.updateUserStatus(user.maNguoiDung, newStatus);
      setSnackbar({ open: true, message: 'Cập nhật trạng thái thành công', severity: 'success' });
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật trạng thái', severity: 'error' });
    }
    setAnchorEl(null);
  };

  const handleFormSubmit = async () => {
    setOpenForm(false);
    setSelectedUser(null);
    await loadUsers();
    setSnackbar({ open: true, message: selectedUser ? 'Cập nhật thành công' : 'Thêm mới thành công', severity: 'success' });
  };

  const getRoleText = (roleId: string) => {
    switch (roleId) {
      case 'VT01':
        return 'Admin';
      case 'VT02':
        return 'Nhân viên';
      case 'VT03':
        return 'Khách hàng';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Hoạt động' ? 'success' : 'error';
  };

  const columns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {params.row.hoTen?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'hoTen',
      headerName: 'Họ tên',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'sdt',
      headerName: 'Số điện thoại',
      width: 130,
    },
    {
      field: 'diaChi',
      headerName: 'Địa chỉ',
      width: 200,
      renderCell: (params) => params.value || 'Chưa cập nhật',
    },
    {
      field: 'maVaiTro',
      headerName: 'Vai trò',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getRoleText(params.value)}
          color={params.value === 'VT01' ? 'error' : params.value === 'VT02' ? 'warning' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'trangThai',
      headerName: 'Trạng thái',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          icon={params.value === 'Hoạt động' ? <CheckCircle /> : <Block />}
        />
      ),
    },
    {
      field: 'ngayTao',
      headerName: 'Ngày tạo',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString('vi-VN'),
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
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<Edit />}
          label="Sửa"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<MoreVert />}
          label="Thêm"
          onClick={(event) => {
            setSelectedUser(params.row);
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
            Quản lý người dùng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý thông tin người dùng trong hệ thống
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          size="large"
        >
          Thêm người dùng
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.maNguoiDung}
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

      {/* User Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </DialogTitle>
        <DialogContent>
          <UserForm
            user={selectedUser}
            onSubmit={handleFormSubmit}
            onCancel={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa người dùng "{selectedUser?.hoTen}"?
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
        <MenuItem onClick={() => handleEdit(selectedUser!)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Chỉnh sửa
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleStatusChange(
              selectedUser!,
              selectedUser?.trangThai === 'Hoạt động' ? 'Khóa' : 'Hoạt động'
            )
          }
        >
          <ListItemIcon>
            {selectedUser?.trangThai === 'Hoạt động' ? (
              <Block fontSize="small" />
            ) : (
              <CheckCircle fontSize="small" />
            )}
          </ListItemIcon>
          {selectedUser?.trangThai === 'Hoạt động' ? 'Khóa tài khoản' : 'Kích hoạt'}
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedUser!)} sx={{ color: 'error.main' }}>
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

export default UserList;
