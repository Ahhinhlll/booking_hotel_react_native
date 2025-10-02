import apiClient from './api';
import type { DatPhong } from '../types';

export const bookingService = {
  // Get all bookings
  getAllBookings: async (): Promise<DatPhong[]> => {
    const response = await apiClient.get<DatPhong[]>('/datphong/getall');
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id: string): Promise<DatPhong> => {
    const response = await apiClient.get<DatPhong>(`/datphong/getbyid/${id}`);
    return response.data;
  },

  // Get bookings by user ID (not implemented in backend)
  getBookingsByUserId: async (userId: string): Promise<DatPhong[]> => {
    const response = await apiClient.get<DatPhong[]>(`/datphong/search?maNguoiDung=${userId}`);
    return response.data;
  },

  // Get bookings by hotel ID (not implemented in backend)
  getBookingsByHotelId: async (hotelId: string): Promise<DatPhong[]> => {
    const response = await apiClient.get<DatPhong[]>(`/datphong/search?maKhachSan=${hotelId}`);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (id: string, status: string): Promise<DatPhong> => {
    const response = await apiClient.put<DatPhong>(`/datphong/update`, { 
      maDatPhong: id,
      trangThai: status 
    });
    return response.data;
  },

  // Update booking
  updateBooking: async (id: string, bookingData: Partial<DatPhong>): Promise<DatPhong> => {
    const response = await apiClient.put<DatPhong>(`/datphong/update`, {
      maDatPhong: id,
      ...bookingData
    });
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id: string): Promise<DatPhong> => {
    const response = await apiClient.put<DatPhong>(`/datphong/update`, { 
      maDatPhong: id,
      trangThai: 'Đã hủy' 
    });
    return response.data;
  },

  // Get booking statistics (not implemented in backend)
  getBookingStats: async () => {
    const response = await apiClient.get('/datphong/getall');
    return response.data;
  },
};
