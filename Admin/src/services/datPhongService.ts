import request from '../utils/request';
import { DatPhong } from '../types';

export const datPhongService = {
  getAll: async (): Promise<DatPhong[]> => {
    const response = await request.get('/datphong/getall');
    return response.data;
  },

  getById: async (id: string): Promise<DatPhong> => {
    const response = await request.get(`/datphong/getbyid/${id}`);
    return response.data;
  },

  create: async (data: Partial<DatPhong>): Promise<DatPhong> => {
    const response = await request.post('/datphong/insert', data);
    return response.data;
  },

  update: async (data: Partial<DatPhong>): Promise<DatPhong> => {
    const response = await request.put('/datphong/update', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/datphong/delete/${id}`);
  },

  search: async (keyword: string): Promise<DatPhong[]> => {
    const response = await request.get('/datphong/search', {
      params: { keyword },
    });
    return response.data;
  },
};

