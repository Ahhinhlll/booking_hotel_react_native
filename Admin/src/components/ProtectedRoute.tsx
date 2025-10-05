import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = authService.getCurrentUser();
  const token = localStorage.getItem('accessToken');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra xem user có phải là Admin không
  if (user.maVaiTro !== 'VT01') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

