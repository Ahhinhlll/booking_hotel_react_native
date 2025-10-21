import request from "../utils/request";

export interface TienNghiData {
  maTienNghi: string;
  tenTienNghi: string;
  maKS?: string;
  maPhong?: string;
}

export class TienNghiServices {
  // Lấy tất cả tiện ích
  static async getAll(): Promise<TienNghiData[]> {
    try {
      const response = await request.get("/tiennghi/getall");
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi trong TienNghiServices.getAll():", error);
      throw error;
    }
  }

  // Lấy tiện ích theo ID
  static async getById(id: string): Promise<TienNghiData> {
    try {
      const response = await request.get(`/tiennghi/getbyid/${id}`);
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi trong TienNghiServices.getById():", error);
      throw error;
    }
  }

  // Lấy tiện ích theo khách sạn (bao gồm tiện ích chung)
  static async getByHotelId(hotelId: string): Promise<TienNghiData[]> {
    try {
      const response = await request.get(`/tiennghi/hotel/${hotelId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi trong TienNghiServices.getByHotelId():", error);
      throw error;
    }
  }

  // Lấy tiện ích theo phòng (bao gồm tiện ích khách sạn và chung)
  static async getByRoomId(roomId: string): Promise<TienNghiData[]> {
    try {
      const response = await request.get(`/tiennghi/room/${roomId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi trong TienNghiServices.getByRoomId():", error);
      throw error;
    }
  }

  // Tìm kiếm tiện ích
  static async search(query: string): Promise<TienNghiData[]> {
    try {
      const response = await request.get(`/tiennghi/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi trong TienNghiServices.search():", error);
      throw error;
    }
  }
}