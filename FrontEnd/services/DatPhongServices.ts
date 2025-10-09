import request from "../utils/request";

export interface DatPhongData {
  maDatPhong: string;
  maND: string;
  maPhong: string;
  loaiDat: string;
  ngayDat: string;
  ngayNhan: string;
  ngayTra: string;
  soNguoiLon: number;
  soTreEm: number;
  soGio: number | null;
  soNgay: number | null;
  tongTienGoc: number;
  tongTienSauGiam: number;
  maKM: string | null;
  trangThai: string;
  ghiChu: string;
  maKS: string;
  maGiaPhong: string;
  NguoiDung?: {
    hoTen: string;
    sdt: string;
    email: string;
  };
  KhachSan?: {
    anh: string[];
    tenKS: string;
    diaChi: string;
    tinhThanh: string;
    hangSao: number;
  };
  Phong?: {
    anh: string[];
    tenPhong: string;
    dienTich: string;
    trangThai: string;
    GiaPhongs?: Array<{
      giaQuaDem: number;
      giaTheoNgay: number;
      gia2GioDau: number;
      gia1GioThem: number;
      loaiDat: string;
    }>;
  };
  KhuyenMai?: {
    anh: string[];
    tenKM: string;
    thongTinKM: string;
    giaTriGiam: number;
    phanTramGiam: number;
  };
  ThanhToans?: Array<{
    phuongThuc: string;
    soTien: number;
    trangThai: string;
    ngayTT: string;
  }>;
  SuCos?: any[];
}

export interface BookingData {
  roomId: string;
  hotelId: string;
  checkInDateTime: string;
  checkOutDateTime: string;
  bookingType: "hourly" | "overnight" | "daily";
  duration: number;
  totalAmount: number;
  promotionId?: string;
  bookerInfo: {
    phoneNumber: string;
    name: string;
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  promotion?: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "momo",
    name: "Ví MoMo",
    icon: "wallet",
    color: "#D946EF",
  },
  {
    id: "zalopay",
    name: "Ví ZaloPay",
    icon: "wallet",
    color: "#00A651",
    promotion: "Nhập mã SALEZLP để được giảm giá cho đơn từ 150K",
  },
  {
    id: "shopeepay",
    name: "Ví ShopeePay",
    icon: "wallet",
    color: "#FF6B35",
    promotion: "Ưu đãi ShopeePay giảm đến 50.000₫",
  },
  {
    id: "credit",
    name: "Thẻ Credit",
    icon: "card",
    color: "#1E40AF",
  },
  {
    id: "atm",
    name: "Thẻ ATM",
    icon: "card",
    color: "#2563EB",
  },
  {
    id: "hotel",
    name: "Trả tại khách sạn",
    icon: "business",
    color: "#6B7280",
  },
];

export class DatPhongServices {
  static async create(data: Omit<DatPhongData, "maDatPhong">) {
    return request.post("/datphong/create", data);
  }

  static async getById(id: string): Promise<DatPhongData> {
    return request.get(`/datphong/getById/${id}`);
  }

  static async getByUser(userId: string): Promise<DatPhongData[]> {
    return request.get(`/datphong/getByUser/${userId}`);
  }

  static async getAll(): Promise<DatPhongData[]> {
    try {
      const response = await request.get("/datphong/getall");
      // Backend trả về { success: true, data: items, message: "..." }
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.warn("⚠️ API không trả về dữ liệu đúng format");
        return [];
      }
    } catch (error) {
      console.error("❌ Lỗi trong DatPhongServices.getAll():", error);
      throw error;
    }
  }

  static async confirmBooking(bookingData: BookingData, paymentMethod: string) {
    return request.post("/datphong/confirm", {
      ...bookingData,
      paymentMethod,
      clientCalculatedTotalAmount: bookingData.totalAmount,
    });
  }

  static async calculatePrice(
    roomId: string,
    bookingType: string,
    duration: number,
    promotionId?: string
  ) {
    return request.post("/datphong/calculate-price", {
      roomId,
      bookingType,
      duration,
      promotionId,
    });
  }

  static async checkAvailability(
    roomId: string,
    checkInDateTime: string,
    checkOutDateTime: string
  ) {
    return request.get("/datphong/check-availability", {
      params: {
        roomId,
        checkInDateTime,
        checkOutDateTime,
      },
    });
  }
}
