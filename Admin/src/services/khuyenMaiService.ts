import request from '../utils/request';
import { KhuyenMai } from '../types';

export const khuyenMaiService = {
  getAll: async (): Promise<KhuyenMai[]> => {
    const response = await request.get('/khuyenmai/getall');
    return response.data || [];
  },

  getById: async (id: string): Promise<KhuyenMai> => {
    const response = await request.get(`/khuyenmai/getbyid/${id}`);
    return response.data;
  },

  create: async (data: Partial<KhuyenMai>): Promise<KhuyenMai> => {
    const response = await request.post('/khuyenmai/insert', data);
    return response.data;
  },

  update: async (data: Partial<KhuyenMai>): Promise<KhuyenMai> => {
    const response = await request.put('/khuyenmai/update', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/khuyenmai/delete/${id}`);
  },

  search: async (keyword: string): Promise<KhuyenMai[]> => {
    const response = await request.get('/khuyenmai/search', {
      params: { q: keyword },
    });
    return response.data || [];
  },
};
