import request from '../utils/request';
import { GiaPhong } from '../types';

export const giaPhongService = {
  getAll: async (): Promise<GiaPhong[]> => {
    const response = await request.get('/giaphong/getall');
    return response.data || [];
  },

  getById: async (id: string): Promise<GiaPhong> => {
    const response = await request.get(`/giaphong/getbyid/${id}`);
    return response.data;
  },

  create: async (data: Partial<GiaPhong>): Promise<GiaPhong> => {
    const response = await request.post('/giaphong/insert', data);
    return response.data;
  },

  update: async (data: Partial<GiaPhong>): Promise<GiaPhong> => {
    const response = await request.put('/giaphong/update', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/giaphong/delete/${id}`);
  },

  search: async (keyword: string): Promise<GiaPhong[]> => {
    const response = await request.get('/giaphong/search', {
      params: { q: keyword },
    });
    return response.data || [];
  },
};
