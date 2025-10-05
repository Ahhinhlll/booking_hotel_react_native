// services/GiaPhongServices.ts
import request from "../utils/request";

export interface GiaPhongData {
  maGiaPhong: string;
  maPhong: string;
  loaiDat: string;
  gia2GioDau: number;
  gia1GioThem: number;
  giaTheoNgay: number;
  giaQuaDem: number;
  trangThai: string;
  tenGia?: string;
  moTa?: string;
}

export const GiaPhongServices = {
  // Lấy tất cả giá phòng
  getAll: async () => {
    const res = await request.get<GiaPhongData[]>("/giaphong/getall");
    return res.data;
  },

  // Lấy giá phòng theo id
  getById: async (id: string) => {
    const res = await request.get<GiaPhongData>(`/giaphong/getbyid/${id}`);
    return res.data;
  },

  // Lấy giá phòng theo mã phòng
  getByMaPhong: async (maPhong: string) => {
    const res = await request.get<GiaPhongData[]>(`/giaphong/getall`);
    // Lọc theo mã phòng từ phía client (vì backend chưa có endpoint này)
    return res.data.filter(item => item.maPhong === maPhong);
  },

  // Thêm mới giá phòng
  insert: async (data: Omit<GiaPhongData, "maGiaPhong">) => {
    const res = await request.post("/giaphong/insert", data);
    return res.data;
  },

  // Cập nhật giá phòng
  update: async (data: Partial<GiaPhongData> & { maGiaPhong: string }) => {
    const res = await request.put("/giaphong/update", data);
    return res.data;
  },

  // Xóa giá phòng theo id
  remove: async (id: string) => {
    const res = await request.delete(`/giaphong/delete/${id}`);
    return res.data;
  },

  // Tìm kiếm giá phòng
  search: async (q: string) => {
    const res = await request.get<GiaPhongData[]>(
      `/giaphong/search?q=${encodeURIComponent(q)}`
    );
    return res.data;
  },
};
