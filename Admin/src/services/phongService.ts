import request from '../utils/request';
import { Phong } from '../types';

export const phongService = {
  getAll: async (): Promise<Phong[]> => {
    const response = await request.get('/phong/getall');
    return response.data || [];
  },

  getById: async (id: string): Promise<Phong> => {
    const response = await request.get(`/phong/getbyid/${id}`);
    return response.data;
  },

  create: async (data: Partial<Phong>): Promise<Phong> => {
    const response = await request.post('/phong/insert', data);
    return response.data;
  },

  update: async (data: Partial<Phong>): Promise<Phong> => {
    const response = await request.put('/phong/update', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/phong/delete/${id}`);
  },

  search: async (keyword: string): Promise<Phong[]> => {
    const response = await request.get('/phong/search', {
      params: { keyword },
    });
    return response.data || [];
  },
};

