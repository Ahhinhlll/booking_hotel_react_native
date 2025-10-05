import request from "../utils/request";

export interface LoaiPhongData {
  maLoaiPhong: string;
  tenLoaiPhong: string;
  moTa?: string;
}

export class LoaiPhongServices {
  static async getAll(): Promise<LoaiPhongData[]> {
    return request.get("/api/loaiphong/getAll");
  }

  static async create(data: Omit<LoaiPhongData, 'maLoaiPhong'>) {
    return request.post("/api/loaiphong/create", data);
  }

  static async getById(id: string): Promise<LoaiPhongData> {
    return request.get(`/api/loaiphong/getById/${id}`);
  }

  static async update(id: string, data: Partial<LoaiPhongData>) {
    return request.put(`/api/loaiphong/update/${id}`, data);
  }

  static async delete(id: string) {
    return request.delete(`/api/loaiphong/delete/${id}`);
  }

  static async getByHotel(hotelId: string): Promise<LoaiPhongData[]> {
    return request.get(`/api/loaiphong/getByHotel/${hotelId}`);
  }
}
