import apiClient from './api';
import type { KhuyenMai } from '../types';

export const promotionService = {
  // Get all promotions
  getAllPromotions: async (): Promise<KhuyenMai[]> => {
    const response = await apiClient.get<KhuyenMai[]>('/khuyenmai/getall');
    return response.data;
  },

  // Get promotion by ID
  getPromotionById: async (id: string): Promise<KhuyenMai> => {
    const response = await apiClient.get<KhuyenMai>(`/khuyenmai/getbyid/${id}`);
    return response.data;
  },

  // Create new promotion
  createPromotion: async (promotionData: Partial<KhuyenMai>): Promise<KhuyenMai> => {
    const response = await apiClient.post<KhuyenMai>('/khuyenmai/insert', promotionData);
    return response.data;
  },

  // Update promotion
  updatePromotion: async (id: string, promotionData: Partial<KhuyenMai>): Promise<KhuyenMai> => {
    const response = await apiClient.put<KhuyenMai>(`/khuyenmai/update`, {
      maKM: id,
      ...promotionData
    });
    return response.data;
  },

  // Delete promotion
  deletePromotion: async (id: string): Promise<void> => {
    await apiClient.delete(`/khuyenmai/delete/${id}`);
  },

  // Update promotion status
  updatePromotionStatus: async (id: string, status: string): Promise<KhuyenMai> => {
    const response = await apiClient.put<KhuyenMai>(`/khuyenmai/update`, { 
      maKM: id,
      trangThai: status 
    });
    return response.data;
  },

  // Get active promotions (use search with filter)
  getActivePromotions: async (): Promise<KhuyenMai[]> => {
    const response = await apiClient.get<KhuyenMai[]>('/khuyenmai/search?trangThai=Hoạt động');
    return response.data;
  },
};
