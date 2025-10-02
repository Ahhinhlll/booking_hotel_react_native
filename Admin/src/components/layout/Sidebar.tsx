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
} from '@mui/material';
import {
  Dashboard,
  People,
  Hotel,
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
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Quản lý người dùng', icon: <People />, path: '/users' },
  { text: 'Quản lý khách sạn', icon: <Hotel />, path: '/hotels' },
  { text: 'Loại phòng', icon: <MeetingRoom />, path: '/room-types' },
  { text: 'Quản lý phòng', icon: <MeetingRoom />, path: '/rooms' },
  { text: 'Quản lý đặt phòng', icon: <BookOnline />, path: '/bookings' },
  { text: 'Quản lý khuyến mãi', icon: <LocalOffer />, path: '/promotions' },
  { text: 'Báo cáo', icon: <Assessment />, path: '/reports' },
  { text: 'Cài đặt', icon: <Settings />, path: '/settings' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleMenuClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">
          Hotel Admin
        </Typography>
        <Typography variant="caption">
          Hệ thống quản trị khách sạn
        </Typography>
      </Box>

      {/* User Info */}
      {user && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'secondary.main' }}>
            {user.hoTen.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="subtitle2" fontWeight="bold">
            {user.hoTen}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.maVaiTro === 'VT01' ? 'Quản trị viên' : 'Nhân viên'}
          </Typography>
        </Box>
      )}

      <Divider />

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleMenuClick(item.path)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: location.pathname === item.path ? 'white' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ mx: 1, borderRadius: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Đăng xuất" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: DRAWER_WIDTH,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
