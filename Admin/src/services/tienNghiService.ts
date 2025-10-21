import request from '../utils/request';

export interface TienNghi {
  maTienNghi: string;
  tenTienNghi: string;
  maKS?: string;
  maPhong?: string;
}

export interface TienNghiCreate {
  tenTienNghi: string;
  maKS?: string;
  maPhong?: string;
}

export interface TienNghiUpdate {
  tenTienNghi?: string;
  maKS?: string;
  maPhong?: string;
}

export class TienNghiService {
  // Lấy tất cả tiện ích
  static async getAll(): Promise<TienNghi[]> {
    try {
      const response = await request.get('/tiennghi/getall');
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi trong TienNghiService.getAll():', error);
      throw error;
    }
  }

  // Lấy tiện ích theo ID
  static async getById(id: string): Promise<TienNghi> {
    try {
      const response = await request.get(`/tiennghi/getbyid/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi trong TienNghiService.getById():', error);
      throw error;
    }
  }

  // Tạo tiện ích mới
  static async create(data: TienNghiCreate): Promise<TienNghi> {
    try {
      const response = await request.post('/tiennghi/insert', data);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi trong TienNghiService.create():', error);
      throw error;
    }
  }

  // Cập nhật tiện ích
  static async update(id: string, data: TienNghiUpdate): Promise<TienNghi> {
    try {
      const response = await request.put(`/tiennghi/update`, {
        maTienNghi: id,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi trong TienNghiService.update():', error);
      throw error;
    }
  }

  // Xóa tiện ích
  static async delete(id: string): Promise<void> {
    try {
      await request.delete(`/tiennghi/delete/${id}`);
    } catch (error) {
      console.error('❌ Lỗi trong TienNghiService.delete():', error);
      throw error;
    }
  }

  // Tìm kiếm tiện ích
  static async search(query: string): Promise<TienNghi[]> {
    try {
      const response = await request.get('/tiennghi/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi trong TienNghiService.search():', error);
      throw error;
    }
  }

  // Lấy tiện ích theo khách sạn
  static async getByHotelId(hotelId: string): Promise<TienNghi[]> {
    try {
      const allTienNghi = await this.getAll();
      return allTienNghi.filter(tienNghi => tienNghi.maKS === hotelId);
    } catch (error) {
      console.error('❌ Lỗi trong TienNghiService.getByHotelId():', error);
      throw error;
    }
  }

  // Lấy tiện ích theo phòng
  static async getByRoomId(roomId: string): Promise<TienNghi[]> {
    try {
      const allTienNghi = await this.getAll();
      return allTienNghi.filter(tienNghi => tienNghi.maPhong === roomId);
    } catch (error) {
      console.error('❌ Lỗi trong TienNghiService.getByRoomId():', error);
      throw error;
    }
  }
}
