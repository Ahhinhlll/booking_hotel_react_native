// services/KhachSanServices.ts
import request from "../utils/request";

export interface KhachSanData {
  maKS: string;
  tenKS: string;
  diaChi?: string;
  dienThoai?: string;
  tinhThanh?: string;
  giaThapNhat?: number;
  anh?: string[];
  trangThai?: string;
  noiBat?: string;
  hangSao?: number;
  diemDanhGia?: number;
  // Related data from backend
  Phongs?: any[];
  KhuyenMais?: any[];
  DanhGia?: any[];
  TienNghis?: any[];
}

export const KhachSanServices = {
  // Lấy tất cả khách sạn
  getAll: async () => {
    const res = await request.get<KhachSanData[]>("/khachsan/getall");
    return res.data;
  },

  // Lấy 6 khách sạn mới nhất
  getRecentHotels: async () => {
    const res = await request.get<KhachSanData[]>("/khachsan/recent");
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
  search: async (params: {
    q?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guests?: number;
    rooms?: number;
    minPrice?: number;
    maxPrice?: number;
    bookingType?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.append("q", params.q);
    if (params.checkInDate)
      queryParams.append("checkInDate", params.checkInDate);
    if (params.checkOutDate)
      queryParams.append("checkOutDate", params.checkOutDate);
    if (params.guests) queryParams.append("guests", params.guests.toString());
    if (params.rooms) queryParams.append("rooms", params.rooms.toString());
    if (params.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.bookingType)
      queryParams.append("bookingType", params.bookingType);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const res = await request.get<KhachSanData[]>(
      `/khachsan/search?${queryParams.toString()}`
    );
    return res.data;
  },
};
