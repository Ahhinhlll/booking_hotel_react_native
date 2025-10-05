import request from '../utils/request';
import { NguoiDung, ApiResponse } from '../types';

export const nguoiDungService = {
  getAll: async (): Promise<NguoiDung[]> => {
    const response = await request.get('/nguoidung/getall');
    return response.data;
  },

  getById: async (id: string): Promise<NguoiDung> => {
    const response = await request.get(`/nguoidung/getbyid/${id}`);
    return response.data;
  },

  create: async (data: Partial<NguoiDung>): Promise<NguoiDung> => {
    const response = await request.post('/nguoidung/insert', data);
    return response.data;
  },

  update: async (data: Partial<NguoiDung>): Promise<NguoiDung> => {
    const response = await request.put('/nguoidung/update', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/nguoidung/delete/${id}`);
  },

  search: async (keyword: string): Promise<NguoiDung[]> => {
    const response = await request.get('/nguoidung/search', {
      params: { keyword },
    });
    return response.data;
  },

  updatePassword: async (data: { maNguoiDung: string; matKhauCu: string; matKhauMoi: string }): Promise<void> => {
    await request.patch('/nguoidung/updatepassword', data);
  },
};

