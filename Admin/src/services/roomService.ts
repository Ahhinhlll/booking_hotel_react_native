import apiClient from './api';
import type { Phong, RoomFormData, LoaiPhong } from '../types';

export const roomService = {
  // Get all rooms
  getAllRooms: async (): Promise<Phong[]> => {
    const response = await apiClient.get<Phong[]>('/phong/getall');
    return response.data;
  },

  // Get room by ID
  getRoomById: async (id: string): Promise<Phong> => {
    const response = await apiClient.get<Phong>(`/phong/getbyid/${id}`);
    return response.data;
  },

  // Get rooms by hotel ID
  getRoomsByHotelId: async (hotelId: string): Promise<Phong[]> => {
    const response = await apiClient.get<Phong[]>(`/phong/getbykhachsan/${hotelId}`);
    return response.data;
  },

  // Create new room
  createRoom: async (roomData: RoomFormData): Promise<Phong> => {
    const response = await apiClient.post<Phong>('/phong/insert', roomData);
    return response.data;
  },

  // Update room
  updateRoom: async (id: string, roomData: Partial<RoomFormData>): Promise<Phong> => {
    const response = await apiClient.put<Phong>(`/phong/update`, {
      maPhong: id,
      ...roomData
    });
    return response.data;
  },

  // Delete room
  deleteRoom: async (id: string): Promise<void> => {
    await apiClient.delete(`/phong/delete/${id}`);
  },

  // Update room status
  updateRoomStatus: async (id: string, status: string): Promise<Phong> => {
    const response = await apiClient.put<Phong>(`/phong/update`, { 
      maPhong: id,
      trangThai: status 
    });
    return response.data;
  },

  // Get room types
  getRoomTypes: async (): Promise<LoaiPhong[]> => {
    const response = await apiClient.get<LoaiPhong[]>('/loaiphong/getall');
    return response.data;
  },

  // Upload room images
  uploadRoomImages: async (id: string, images: FormData): Promise<string[]> => {
    const response = await apiClient.post<string[]>(`/upload/phong/${id}`, images, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
