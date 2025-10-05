import request from "../utils/request";

export interface DatPhongData {
  maDatPhong: string;
  maNguoiDung: string;
  maPhong: string;
  ngayDat: string;
  ngayTra: string;
  trangThai: string;
  tongTien: number;
  Phong?: {
    maPhong: string;
    tenPhong: string;
    dienTich: string;
    thongTin: string;
    moTa: string;
    KhachSan?: {
      tenKS: string;
    };
  };
  NguoiDung?: {
    hoTen: string;
    email: string;
    soDienThoai: string;
  };
}

export class DatPhongServices {
  static async create(data: Omit<DatPhongData, 'maDatPhong'>) {
    return request.post("/api/datphong/create", data);
  }

  static async getById(id: string): Promise<DatPhongData> {
    return request.get(`/api/datphong/getById/${id}`);
  }

  static async getByUser(userId: string): Promise<DatPhongData[]> {
    return request.get(`/api/datphong/getByUser/${userId}`);
  }

  static async updateStatus(id: string, status: string) {
    return request.put(`/api/datphong/updateStatus/${id}`, { trangThai: status });
  }

  static async cancel(id: string) {
    return request.put(`/api/datphong/cancel/${id}`);
  }

  static async getStatistics() {
    return request.get("/api/datphong/statistics");
  }
}
