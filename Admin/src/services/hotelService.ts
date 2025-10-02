import apiClient from './api';
import type { KhachSan, HotelFormData } from '../types';

export const hotelService = {
  // Get all hotels
  getAllHotels: async (): Promise<KhachSan[]> => {
    const response = await apiClient.get<KhachSan[]>('/khachsan/getall');
    return response.data;
  },

  // Get hotel by ID
  getHotelById: async (id: string): Promise<KhachSan> => {
    const response = await apiClient.get<KhachSan>(`/khachsan/getbyid/${id}`);
    return response.data;
  },

  // Create new hotel
  createHotel: async (hotelData: HotelFormData): Promise<KhachSan> => {
    const response = await apiClient.post<KhachSan>('/khachsan/insert', hotelData);
    return response.data;
  },

  // Update hotel
  updateHotel: async (id: string, hotelData: Partial<HotelFormData>): Promise<KhachSan> => {
    const response = await apiClient.put<KhachSan>(`/khachsan/update`, {
      maKhachSan: id,
      ...hotelData
    });
    return response.data;
  },

  // Delete hotel
  deleteHotel: async (id: string): Promise<void> => {
    await apiClient.delete(`/khachsan/delete/${id}`);
  },

  // Update hotel status
  updateHotelStatus: async (id: string, status: string): Promise<KhachSan> => {
    const response = await apiClient.put<KhachSan>(`/khachsan/update`, { 
      maKhachSan: id,
      trangThai: status 
    });
    return response.data;
  },

  // Upload hotel images
  uploadHotelImages: async (id: string, images: FormData): Promise<string[]> => {
    const response = await apiClient.post<string[]>(`/upload/khachsan/${id}`, images, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Search hotels
  searchHotels: async (query: string): Promise<KhachSan[]> => {
    const response = await apiClient.get<KhachSan[]>(`/khachsan/search?q=${query}`);
    return response.data;
  },
};
