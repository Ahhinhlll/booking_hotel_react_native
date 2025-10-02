import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  InputBase,
  alpha,
} from '@mui/material';
import {
  Notifications,
  AccountCircle,
  Settings,
  ExitToApp,
  Search,
  Language,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 280;

const DesktopHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotifAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        bgcolor: 'white',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Search Bar */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            },
            width: { xs: '100%', sm: 'auto' },
            maxWidth: 400,
          }}
        >
          <Box
            sx={{
              padding: (theme) => theme.spacing(0, 2),
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search color="action" />
          </Box>
          <InputBase
            placeholder="Tìm kiếm..."
            sx={{
              color: 'inherit',
              '& .MuiInputBase-input': {
                padding: (theme) => theme.spacing(1, 1, 1, 0),
                paddingLeft: (theme) => `calc(1em + ${theme.spacing(4)})`,
                width: { xs: '100%', sm: '30ch' },
              },
            }}
          />
        </Box>

        {/* Right Side Icons */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Language Switcher */}
          <IconButton color="inherit" size="small">
            <Language />
          </IconButton>

          {/* Dark Mode Toggle */}
          <IconButton color="inherit" size="small" onClick={toggleDarkMode}>
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotifMenuOpen}
            size="small"
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* User Profile */}
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
            sx={{ ml: 1 }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: 14,
              }}
            >
              {user?.hoTen.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography variant="body2" fontWeight={600}>
              {user?.hoTen}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.maVaiTro === 'VT01' ? 'Admin' : 'Staff'}
            </Typography>
          </Box>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 220, mt: 1 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.hoTen}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>Hồ sơ</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cài đặt</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <ExitToApp fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>
              <Typography color="error">Đăng xuất</Typography>
            </ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 320, mt: 1 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Thông báo
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Đặt phòng mới
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Khách hàng vừa đặt phòng Deluxe
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                2 phút trước
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Thanh toán thành công
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Booking #1234 đã thanh toán
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                15 phút trước
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Đánh giá mới
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Khách sạn ABC nhận đánh giá 5 sao
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                1 giờ trước
              </Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default DesktopHeader;

