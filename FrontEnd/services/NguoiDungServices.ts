// services/NguoiDungServices.ts
import request from "../utils/request";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserData {
  maNguoiDung: string;
  hoTen: string;
  email: string;
  sdt: string;
  maVaiTro: string;
  trangThai: string;
  diaChi?: string;
  anhNguoiDung?: string | string[];
}

export const NguoiDungServices = {
  // Lấy tất cả người dùng
  getAll: async () => {
    const res = await request.get<UserData[]>("/nguoidung/getall");
    return res.data;
  },

  // Lấy người dùng theo id
  getById: async (id: string) => {
    const res = await request.get<UserData>(`/nguoidung/getbyid/${id}`);
    return res.data;
  },

  // Tìm kiếm người dùng
  search: async (q: string) => {
    const res = await request.get<UserData[]>(
      `/nguoidung/search?q=${encodeURIComponent(q)}`
    );
    return res.data;
  },

  // Lấy người dùng hiện tại từ AsyncStorage
  getCurrentUser: async (): Promise<UserData | null> => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        return JSON.parse(storedUser) as UserData;
      }
      return null;
    } catch (error) {
      console.error("Lỗi khi lấy current user:", error);
      return null;
    }
  },

  // Thêm mới người dùng
  insert: async (data: UserData & { matKhau: string }) => {
    const res = await request.post("/nguoidung/insert", data);
    return res.data;
  },

  // Cập nhật thông tin người dùng
  update: async (data: Partial<UserData> & { maNguoiDung: string }) => {
    const res = await request.put("/nguoidung/update", data);
    return res.data;
  },

  // Xóa người dùng theo id
  remove: async (id: string) => {
    const res = await request.delete(`/nguoidung/delete/${id}`);
    return res.data;
  },

  // Cập nhật mật khẩu
  updatePassword: async (data: {
    email?: string;
    sdt?: string;
    matKhauCu: string;
    matKhauMoi: string;
  }) => {
    const res = await request.put("/nguoidung/updatepassword", data);
    return res.data;
  },
};
