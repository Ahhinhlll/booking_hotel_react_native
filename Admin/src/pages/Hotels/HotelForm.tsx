import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Rating,
  Typography,
} from '@mui/material';
import Grid from '../../components/common/Grid';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { KhachSan, HotelFormData } from '../../types';
import { hotelService } from '../../services/hotelService';

const schema = yup.object().shape({
  tenKS: yup.string().required('Tên khách sạn là bắt buộc'),
  diaChi: yup.string(),
  dienThoai: yup.string().matches(/^[0-9]*$/, 'Số điện thoại chỉ được chứa số'),
  tinhThanh: yup.string(),
  hangSao: yup.number().min(1, 'Hạng sao tối thiểu là 1').max(5, 'Hạng sao tối đa là 5').required('Hạng sao là bắt buộc'),
  trangThai: yup.string().required('Trạng thái là bắt buộc'),
  noiBat: yup.string().required('Loại nổi bật là bắt buộc'),
});

interface HotelFormProps {
  hotel?: KhachSan | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const statusOptions = [
  { value: 'Hoạt động', label: 'Hoạt động' },
  { value: 'Khóa', label: 'Khóa' },
  { value: 'Bảo trì', label: 'Bảo trì' },
];

const featuredOptions = [
  { value: 'Nổi bật', label: 'Nổi bật' },
  { value: 'Bình thường', label: 'Bình thường' },
];

const provinces = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];

const HotelForm: React.FC<HotelFormProps> = ({ hotel, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const isEdit = !!hotel;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<HotelFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      tenKS: hotel?.tenKS || '',
      diaChi: hotel?.diaChi || '',
      dienThoai: hotel?.dienThoai || '',
      tinhThanh: hotel?.tinhThanh || '',
      hangSao: hotel?.hangSao || 3,
      trangThai: hotel?.trangThai || 'Hoạt động',
      noiBat: hotel?.noiBat || 'Bình thường',
    },
  });


  const handleFormSubmit = async (data: HotelFormData) => {
    try {
      setLoading(true);
      setError('');

      if (isEdit) {
        await hotelService.updateHotel(hotel!.maKS, data);
      } else {
        await hotelService.createHotel(data);
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
        <Grid item xs={12}>
          <Controller
            name="tenKS"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Tên khách sạn"
                error={!!errors.tenKS}
                helperText={errors.tenKS?.message}
                margin="normal"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="tinhThanh"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal">
                <InputLabel>Tỉnh thành</InputLabel>
                <Select {...field} label="Tỉnh thành">
                  {provinces.map((province) => (
                    <MenuItem key={province} value={province}>
                      {province}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="dienThoai"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Số điện thoại"
                error={!!errors.dienThoai}
                helperText={errors.dienThoai?.message}
                margin="normal"
              />
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
                label="Địa chỉ chi tiết"
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
          <Box sx={{ mt: 2 }}>
            <Typography component="legend" gutterBottom>
              Hạng sao
            </Typography>
            <Controller
              name="hangSao"
              control={control}
              render={({ field }) => (
                <Rating
                  {...field}
                  value={field.value}
                  onChange={(_, newValue) => field.onChange(newValue || 1)}
                  max={5}
                  size="large"
                />
              )}
            />
            {errors.hangSao && (
              <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                {errors.hangSao.message}
              </Typography>
            )}
          </Box>
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

        <Grid item xs={12} md={6}>
          <Controller
            name="noiBat"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!errors.noiBat}>
                <InputLabel>Loại nổi bật</InputLabel>
                <Select {...field} label="Loại nổi bật">
                  {featuredOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
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

export default HotelForm;
