import React, { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Hotel as HotelIcon,
  Login as LoginIcon,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginCredentials } from '../../types';

const ModernLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    identifier: '',
    matKhau: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          opacity: 0.1,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'white',
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-20px)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'white',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1100 }}>
          <Card
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              minHeight: 600,
            }}
          >
            {/* Left Panel - Branding */}
            <Box
              sx={{
                flex: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.1,
                  background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}
              />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <HotelIcon sx={{ fontSize: 60 }} />
                </Box>

                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Hotel Admin
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
                  Hệ Thống Quản Trị Khách Sạn
                </Typography>

                <Stack spacing={2} sx={{ maxWidth: 400, mx: 'auto' }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <AdminPanelSettings />
                    <Box textAlign="left">
                      <Typography variant="subtitle1" fontWeight={600}>
                        Quản lý toàn diện
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Dashboard, báo cáo, thống kê
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <HotelIcon />
                    <Box textAlign="left">
                      <Typography variant="subtitle1" fontWeight={600}>
                        Đặt phòng thông minh
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Theo dõi và quản lý đặt phòng
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* Right Panel - Login Form */}
            <Box
              sx={{
                flex: 1,
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                bgcolor: 'white',
              }}
            >
              <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Đăng nhập
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vui lòng nhập thông tin đăng nhập của bạn
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Email hoặc Số điện thoại"
                    name="identifier"
                    value={credentials.identifier}
                    onChange={handleChange}
                    required
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    name="matKhau"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.matKhau}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={<LoginIcon />}
                    sx={{
                      py: 1.5,
                      fontSize: 16,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                      },
                    }}
                  >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </Stack>
              </form>

              <Divider sx={{ my: 4 }}>
                <Chip label="hoặc" size="small" />
              </Divider>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                  border: '1px dashed',
                  borderColor: 'grey.300',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Tài khoản demo:
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip
                    label="admin@hotel.com"
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      setCredentials({ ...credentials, identifier: 'admin@hotel.com' })
                    }
                  />
                  <Chip
                    label="admin123"
                    size="small"
                    variant="outlined"
                    onClick={() => setCredentials({ ...credentials, matKhau: 'admin123' })}
                  />
                </Stack>
              </Box>
            </Box>
          </Card>

          {/* Footer */}
          <Box textAlign="center" mt={4}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              © 2025 Hotel Admin System. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ModernLoginPage;

