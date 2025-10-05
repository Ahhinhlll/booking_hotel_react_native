// services/KhuyenMaiServices.ts
import request from "../utils/request";

export interface KhuyenMaiData {
  maKM: string;
  tenKM: string;
  thongTinKM?: string;
  phanTramGiam?: number;
  giaTriGiam?: number;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  anh?: string[];
  maKS?: string;
  maPhong?: string;
  trangThai?: string;
}

export const KhuyenMaiServices = {
  // Lấy tất cả khuyến mãi
  getAll: async () => {
    const res = await request.get<KhuyenMaiData[]>("/khuyenmai/getall");
    return res.data;
  },

  // Lấy khuyến mãi theo id
  getById: async (id: string) => {
    const res = await request.get<KhuyenMaiData>(`/khuyenmai/getbyid/${id}`);
    return res.data;
  },

  // Tìm kiếm khuyến mãi
  search: async (query: string) => {
    const res = await request.get<KhuyenMaiData[]>(`/khuyenmai/search?q=${query}`);
    return res.data;
  },

  // Thêm mới khuyến mãi
  insert: async (data: Omit<KhuyenMaiData, "maKM">) => {
    const res = await request.post("/khuyenmai/insert", data);
    return res.data;
  },

  // Cập nhật khuyến mãi
  update: async (data: Partial<KhuyenMaiData> & { maKM: string }) => {
    const res = await request.put("/khuyenmai/update", data);
    return res.data;
  },

  // Xóa khuyến mãi theo id
  remove: async (id: string) => {
    const res = await request.delete(`/khuyenmai/delete/${id}`);
    return res.data;
  },
};
