import request from '../utils/request';
import { KhachSan } from '../types';

export const khachSanService = {
  getAll: async (): Promise<KhachSan[]> => {
    const response = await request.get('/khachsan/getall');
    return response.data || [];
  },

  getById: async (id: string): Promise<KhachSan> => {
    const response = await request.get(`/khachsan/getbyid/${id}`);
    return response.data;
  },

  create: async (data: Partial<KhachSan>): Promise<KhachSan> => {
    const response = await request.post('/khachsan/insert', data);
    return response.data;
  },

  update: async (data: Partial<KhachSan>): Promise<KhachSan> => {
    const response = await request.put('/khachsan/update', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/khachsan/delete/${id}`);
  },

  search: async (keyword: string): Promise<KhachSan[]> => {
    const response = await request.get('/khachsan/search', {
      params: { keyword },
    });
    return response.data || [];
  },
};

