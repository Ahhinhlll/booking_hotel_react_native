import request from '../utils/request';
import { LoaiPhong } from '../types';

export const loaiPhongService = {
  getAll: async (): Promise<LoaiPhong[]> => {
    const response = await request.get('/loaiphong/getall');
    return response.data || [];
  },

  getById: async (id: string): Promise<LoaiPhong> => {
    const response = await request.get(`/loaiphong/getbyid/${id}`);
    return response.data;
  },

  create: async (data: Partial<LoaiPhong>): Promise<LoaiPhong> => {
    const response = await request.post('/loaiphong/insert', data);
    return response.data;
  },

  update: async (data: Partial<LoaiPhong>): Promise<LoaiPhong> => {
    const response = await request.put('/loaiphong/update', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/loaiphong/delete/${id}`);
  },

  search: async (keyword: string): Promise<LoaiPhong[]> => {
    const response = await request.get('/loaiphong/search', {
      params: { q: keyword },
    });
    return response.data || [];
  },
};
