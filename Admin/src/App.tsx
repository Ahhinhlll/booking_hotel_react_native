import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import HotelManagement from './pages/HotelManagement';
import RoomManagement from './pages/RoomManagement';
import GiaPhongManagement from './pages/GiaPhongManagement';
import BookingManagement from './pages/BookingManagement';
import PromotionManagement from './pages/PromotionManagement';
import DanhGiaManagement from './pages/DanhGiaManagement';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="hotels" element={<HotelManagement />} />
            <Route path="rooms" element={<RoomManagement />} />
            <Route path="room-prices" element={<GiaPhongManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="promotions" element={<PromotionManagement />} />
            <Route path="reviews" element={<DanhGiaManagement />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
