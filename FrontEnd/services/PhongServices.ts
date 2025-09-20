// services/PhongServices.ts
import request from "../utils/request";

export interface PhongData {
  maPhong: string;
  maKS: string;
  maLoaiPhong: string;
  tenPhong?: string;
  dienTich?: string;
  thongTin?: string;
  moTa?: string;
  trangThai?: string;
  anh?: string | string[];
  // Thêm các trường khác nếu cần
}

export const PhongServices = {
  // Lấy tất cả phòng
  getAll: async () => {
    const res = await request.get<PhongData[]>("/phong/getall");
    return res.data;
  },

  // Lấy phòng theo id
  getById: async (id: string) => {
    const res = await request.get<PhongData>(`/phong/getbyid/${id}`);
    return res.data;
  },

  // Lấy danh sách phòng theo khách sạn
  getByKhachSan: async (maKS: string) => {
    const res = await request.get<PhongData[]>(`/phong/getbykhachsan/${maKS}`);
    return res.data;
  },

  // Thêm mới phòng
  insert: async (data: Omit<PhongData, "maPhong">) => {
    const res = await request.post("/phong/insert", data);
    return res.data;
  },

  // Cập nhật phòng
  update: async (data: Partial<PhongData> & { maPhong: string }) => {
    const res = await request.put("/phong/update", data);
    return res.data;
  },

  // Xóa phòng theo id
  remove: async (id: string) => {
    const res = await request.delete(`/phong/delete/${id}`);
    return res.data;
  },

  // Tìm kiếm phòng
  search: async (q: string) => {
    const res = await request.get<PhongData[]>(
      `/phong/search?q=${encodeURIComponent(q)}`
    );
    return res.data;
  },
};
