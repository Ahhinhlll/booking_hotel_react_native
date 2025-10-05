// Types cho Admin System

export interface LoginRequest {
  email: string;
  matKhau: string;
}

export interface LoginPayload {
  identifier: string; // email or phone number
  matKhau: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: NguoiDung;
}

export interface NguoiDung {
  maNguoiDung: string;
  hoTen: string;
  email: string;
  sdt: string;
  diaChi?: string;
  anhNguoiDung?: string[];
  maVaiTro: string;
  ngayTao: string;
  trangThai: string;
  VaiTro?: VaiTro;
}

export interface VaiTro {
  maVaiTro: string;
  tenVaiTro: string;
  moTa?: string;
}

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

export interface Phong {
  maPhong: string;
  tenPhong: string;
  maKS: string;
  maLoaiPhong: string;
  soGiuong: number;
  dienTich: number;
  sucChua: number;
  soLuongPhong: number;
  anh?: string[];
  trangThai: string;
  moTa?: string;
  KhachSan?: KhachSan;
  LoaiPhong?: LoaiPhong;
}

export interface LoaiPhong {
  maLoaiPhong: string;
  tenLoaiPhong: string;
  moTa?: string;
}

export interface DatPhong {
  maDatPhong: string;
  maNguoiDung: string;
  maPhong: string;
  maKS: string;
  ngayNhanPhong: string;
  ngayTraPhong: string;
  soNguoiLon: number;
  soTreEm: number;
  tongTien: number;
  trangThai: string;
  ngayDat: string;
  ghiChu?: string;
  NguoiDung?: NguoiDung;
  Phong?: Phong;
  KhachSan?: KhachSan;
}

export interface KhuyenMai {
  maKhuyenMai: string;
  tenKhuyenMai: string;
  maKS: string;
  moTa?: string;
  phanTramGiam: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: string;
  KhachSan?: KhachSan;
}

export interface DanhGia {
  maDanhGia: string;
  maNguoiDung: string;
  maKS: string;
  diemDanhGia: number;
  noiDung?: string;
  ngayDanhGia: string;
  NguoiDung?: NguoiDung;
  KhachSan?: KhachSan;
}

export interface TienNghi {
  maTienNghi: string;
  tenTienNghi: string;
  maKS: string;
  loai: string;
  icon?: string;
}

export interface ThanhToan {
  maThanhToan: string;
  maDatPhong: string;
  soTien: number;
  phuongThucThanhToan: string;
  trangThai: string;
  ngayThanhToan: string;
  DatPhong?: DatPhong;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalHotels: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: DatPhong[];
  monthlyRevenue: { month: string; revenue: number }[];
}

