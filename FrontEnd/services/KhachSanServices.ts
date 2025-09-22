// services/KhachSanServices.ts
import request from "../utils/request";

export interface KhachSanData {
  maKS: string;
  tenKS: string;
  diaChi?: string;
  dienThoai?: string;
  tinhThanh?: string;
  giaChiTu?: number;
  anh?: string | string[];
  trangThai?: string;
  hangSao?: number;
}

export const KhachSanServices = {
  // Lấy tất cả khách sạn
  getAll: async () => {
    const res = await request.get<KhachSanData[]>("/khachsan/getall");
    return res.data;
  },

  // Lấy khách sạn theo id
  getById: async (id: string) => {
    const res = await request.get<KhachSanData>(`/khachsan/getbyid/${id}`);
    return res.data;
  },

  // Thêm mới khách sạn
  insert: async (data: Omit<KhachSanData, "maKS">) => {
    const res = await request.post("/khachsan/insert", data);
    return res.data;
  },

  // Cập nhật khách sạn
  update: async (data: Partial<KhachSanData> & { maKS: string }) => {
    const res = await request.put("/khachsan/update", data);
    return res.data;
  },

  // Xóa khách sạn theo id
  remove: async (id: string) => {
    const res = await request.delete(`/khachsan/delete/${id}`);
    return res.data;
  },

  // Tìm kiếm khách sạn
  search: async (q: string) => {
    const res = await request.get<KhachSanData[]>(
      `/khachsan/search?q=${encodeURIComponent(q)}`
    );
    return res.data;
  },
};
