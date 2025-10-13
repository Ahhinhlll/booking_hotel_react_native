import request from '../utils/request';
import { DanhGia } from '../types';

export const danhGiaService = {
  getAll: async (): Promise<DanhGia[]> => {
    const response = await request.get('/danhgia/getall');
    return response.data || [];
  },

  getById: async (id: string): Promise<DanhGia> => {
    const response = await request.get(`/danhgia/getbyid/${id}`);
    return response.data;
  },

  create: async (data: Partial<DanhGia>): Promise<DanhGia> => {
    const response = await request.post('/danhgia/insert', data);
    return response.data;
  },

  update: async (id: string, data: Partial<DanhGia>): Promise<DanhGia> => {
    const response = await request.put(`/danhgia/update/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/danhgia/delete/${id}`);
  },

  search: async (keyword: string): Promise<DanhGia[]> => {
    const response = await request.get('/danhgia/search', {
      params: { q: keyword },
    });
    return response.data || [];
  },
};
