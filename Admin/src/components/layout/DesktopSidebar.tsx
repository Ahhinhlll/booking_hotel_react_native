import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  People,
  Hotel,
  Category,
  MeetingRoom,
  BookOnline,
  LocalOffer,
  Assessment,
  Settings,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 280;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Người dùng', icon: <People />, path: '/users' },
  { text: 'Khách sạn', icon: <Hotel />, path: '/hotels' },
  { text: 'Loại phòng', icon: <Category />, path: '/room-types' },
  { text: 'Phòng', icon: <MeetingRoom />, path: '/rooms' },
  { text: 'Đặt phòng', icon: <BookOnline />, path: '/bookings', badge: 5 },
  { text: 'Khuyến mãi', icon: <LocalOffer />, path: '/promotions' },
  { text: 'Báo cáo', icon: <Assessment />, path: '/reports' },
  { text: 'Cài đặt', icon: <Settings />, path: '/settings' },
];

const DesktopSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          background: 'linear-gradient(180deg, #1976d2 0%, #1565c0 100%)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', color: 'white' }}>
        <Hotel sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h6" fontWeight="bold">
          Hotel Admin
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          Hệ thống quản trị
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* User Info */}
      {user && (
        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 40, height: 40 }}>
              {user.hoTen.charAt(0).toUpperCase()}
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white' }}>
                {user.hoTen}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {user.maVaiTro === 'VT01' ? 'Administrator' : 'Staff'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, py: 2, px: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => handleMenuClick(item.path)}
                sx={{
                  borderRadius: 2,
                  color: 'white',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 20,
                      minWidth: 20,
                      fontSize: 11,
                      bgcolor: 'error.main',
                      color: 'white',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Logout */}
      <List sx={{ px: 1, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText 
              primary="Đăng xuất"
              primaryTypographyProps={{ fontSize: 14 }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default DesktopSidebar;

