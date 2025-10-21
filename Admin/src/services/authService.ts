import request from '../utils/request';
import { LoginRequest, LoginResponse } from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await request.post('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await request.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('userUpdated'));
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  updateCurrentUser: (userData: any) => {
    localStorage.setItem('user', JSON.stringify(userData));
  },
};

