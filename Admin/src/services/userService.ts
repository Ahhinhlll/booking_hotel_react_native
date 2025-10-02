import apiClient from './api';
import type { User, UserFormData } from '../types';

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/nguoidung/getall');
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/nguoidung/getbyid/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: UserFormData): Promise<User> => {
    const response = await apiClient.post<User>('/nguoidung/insert', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, userData: Partial<UserFormData>): Promise<User> => {
    const response = await apiClient.put<User>(`/nguoidung/update`, {
      maNguoiDung: id,
      ...userData
    });
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/nguoidung/delete/${id}`);
  },

  // Update user status
  updateUserStatus: async (id: string, status: string): Promise<User> => {
    const response = await apiClient.put<User>(`/nguoidung/update`, { 
      maNguoiDung: id,
      trangThai: status 
    });
    return response.data;
  },

  // Get users by role (search with role filter)
  getUsersByRole: async (roleId: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/nguoidung/search?maVaiTro=${roleId}`);
    return response.data;
  },
};
