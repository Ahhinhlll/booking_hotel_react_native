import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { User, UserFormData, VaiTro } from '../../types';
import { userService } from '../../services/userService';

const schema = yup.object().shape({
  hoTen: yup.string().required('Họ tên là bắt buộc'),
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  sdt: yup.string().required('Số điện thoại là bắt buộc').matches(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số'),
  diaChi: yup.string(),
  maVaiTro: yup.string().required('Vai trò là bắt buộc'),
  trangThai: yup.string().required('Trạng thái là bắt buộc'),
  matKhau: yup.string().when('$isEdit', {
    is: false,
    then: (schema) => schema.required('Mật khẩu là bắt buộc').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    otherwise: (schema) => schema,
  }),
});

interface UserFormProps {
  user?: User | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const roles: VaiTro[] = [
  { maVaiTro: 'VT01', tenVT: 'Admin', moTa: 'Quản trị viên' },
  { maVaiTro: 'VT02', tenVT: 'Staff', moTa: 'Nhân viên' },
  { maVaiTro: 'VT03', tenVT: 'User', moTa: 'Khách hàng' },
];

const statusOptions = [
  { value: 'Hoạt động', label: 'Hoạt động' },
  { value: 'Khóa', label: 'Khóa' },
];

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const isEdit = !!user;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: yupResolver(schema, { context: { isEdit } }),
    defaultValues: {
      hoTen: '',
      email: '',
      sdt: '',
      diaChi: '',
      maVaiTro: 'VT03',
      trangThai: 'Hoạt động',
      matKhau: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        hoTen: user.hoTen,
        email: user.email,
        sdt: user.sdt,
        diaChi: user.diaChi || '',
        maVaiTro: user.maVaiTro,
        trangThai: user.trangThai,
      });
    }
  }, [user, reset]);

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      setLoading(true);
      setError('');

      if (isEdit) {
        await userService.updateUser(user!.maNguoiDung, data);
      } else {
        await userService.createUser(data);
      }

      onSubmit();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="hoTen"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Họ tên"
                error={!!errors.hoTen}
                helperText={errors.hoTen?.message}
                margin="normal"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                margin="normal"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="sdt"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Số điện thoại"
                error={!!errors.sdt}
                helperText={errors.sdt?.message}
                margin="normal"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="maVaiTro"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!errors.maVaiTro}>
                <InputLabel>Vai trò</InputLabel>
                <Select {...field} label="Vai trò">
                  {roles.map((role) => (
                    <MenuItem key={role.maVaiTro} value={role.maVaiTro}>
                      {role.tenVT}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="diaChi"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Địa chỉ"
                multiline
                rows={2}
                error={!!errors.diaChi}
                helperText={errors.diaChi?.message}
                margin="normal"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="trangThai"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!errors.trangThai}>
                <InputLabel>Trạng thái</InputLabel>
                <Select {...field} label="Trạng thái">
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        {!isEdit && (
          <Grid item xs={12} md={6}>
            <Controller
              name="matKhau"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Mật khẩu"
                  type="password"
                  error={!!errors.matKhau}
                  helperText={errors.matKhau?.message}
                  margin="normal"
                />
              )}
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {isEdit ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </Box>
    </Box>
  );
};

export default UserForm;
