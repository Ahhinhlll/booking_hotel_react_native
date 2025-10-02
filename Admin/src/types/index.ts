// Auth Types
export interface User {
  maNguoiDung: string;
  hoTen: string;
  email: string;
  sdt: string;
  diaChi?: string;
  anhNguoiDung?: string[];
  maVaiTro: string;
  trangThai: string;
  ngayTao: string;
}

export interface LoginCredentials {
  identifier: string; // email or phone
  matKhau: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Hotel Types
export interface KhachSan {
  maKS: string;
  tenKS: string;
  diaChi?: string;
  dienThoai?: string;
  tinhThanh?: string;
  giaThapNhat?: number;
  anh?: string[];
  hangSao: number;
  diemDanhGia: number;
  trangThai: string;
  noiBat: string;
}

// Room Types
export interface LoaiPhong {
  maLoaiPhong: string;
  tenLoaiPhong: string;
  moTa?: string;
  soNguoiToiDa: number;
}

export interface Phong {
  maPhong: string;
  maKS: string;
  maLoaiPhong: string;
  tenPhong?: string;
  dienTich?: string;
  moTa?: string;
  trangThai: string;
  anh?: string[];
  gia: number;
  KhachSan?: KhachSan;
  LoaiPhong?: LoaiPhong;
}

// Booking Types
export interface DatPhong {
  maDatPhong: string;
  maND: string;
  maPhong: string;
  maKS?: string;
  loaiDat: string;
  ngayDat: string;
  ngayNhan?: string;
  ngayTra?: string;
  soNguoiLon?: number;
  soTreEm?: number;
  soGio?: number;
  soNgay?: number;
  tongTienGoc?: number;
  tongTienSauGiam?: number;
  maKM?: string;
  trangThai?: string;
  ghiChu?: string;
  NguoiDung?: User;
  KhachSan?: KhachSan;
  Phong?: Phong;
}

// Promotion Types
export interface KhuyenMai {
  maKM: string;
  tenKM: string;
  moTa?: string;
  phanTramGiam: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: string;
  maKS?: string;
  maPhong?: string;
}

// Role Types
export interface VaiTro {
  maVaiTro: string;
  tenVT: string;
  moTa?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Form Types
export interface HotelFormData {
  tenKS: string;
  diaChi?: string;
  dienThoai?: string;
  tinhThanh?: string;
  hangSao: number;
  trangThai: string;
  noiBat: string;
}

export interface RoomFormData {
  maKS: string;
  maLoaiPhong: string;
  tenPhong?: string;
  dienTich?: string;
  moTa?: string;
  gia: number;
  trangThai: string;
}

export interface UserFormData {
  hoTen: string;
  email: string;
  sdt: string;
  diaChi?: string;
  maVaiTro: string;
  trangThai: string;
  matKhau?: string;
}
