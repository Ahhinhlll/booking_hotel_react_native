import request from "../utils/request";

export interface TienNghiData {
  maTienNghi: string;
  tenTienNghi: string;
  moTa?: string;
  icon?: string;
}

export class TienNghiServices {
  static async getAll(): Promise<TienNghiData[]> {
    return request.get("/api/tiennghi/getAll");
  }

  static async create(data: Omit<TienNghiData, 'maTienNghi'>) {
    return request.post("/api/tiennghi/create", data);
  }

  static async getById(id: string): Promise<TienNghiData> {
    return request.get(`/api/tiennghi/getById/${id}`);
  }

  static async update(id: string, data: Partial<TienNghiData>) {
    return request.put(`/api/tiennghi/update/${id}`, data);
  }

  static async delete(id: string) {
    return request.delete(`/api/tiennghi/delete/${id}`);
  }

  static async getByRoomType(roomTypeId: string): Promise<TienNghiData[]> {
    return request.get(`/api/tiennghi/getByRoomType/${roomTypeId}`);
  }
}
