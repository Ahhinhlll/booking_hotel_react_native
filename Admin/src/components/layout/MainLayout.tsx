import React from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import DesktopHeader from './DesktopHeader';

const DRAWER_WIDTH = 280;

const MainLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <DesktopSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <DesktopHeader />
        <Box sx={{ mt: 8 }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
