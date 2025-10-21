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

export interface CompletedBookingData {
  maDP: string;
  maND: string;
  maPhong: string;
  maKS: string;
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
  maGiaPhong: string;
  tenNguoiDat: string;
  sdtNguoiDat: string;
  emailNguoiDat: string;
  tenKS: string;
  diaChiKS: string;
  tinhThanhKS: string;
  tenPhong: string;
  anhPhong: string[];
  dienTichPhong: string;
  hasReviewed: boolean;
  completedAt: string;
  originalId: string;
  status: string;
  // Thông tin review nếu có
  review?: {
    maDG: string;
    soSao: number;
    binhLuan: string;
    ngayDG: string;
  };
}

export interface RoomBookingStatus {
  isBooked: boolean;
  bookingInfo: {
    maDatPhong: string;
    trangThai: string;
    ngayNhan: string;
    ngayTra: string;
    loaiDat: string;
    nguoiDat: string;
    sdt: string;
  } | null;
  message: string;
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
    const requestData = {
      ...bookingData,
      paymentMethod,
      clientCalculatedTotalAmount: bookingData.totalAmount,
    };

    try {
      const response = await request.post("/datphong/insert", requestData);
      return response;
    } catch (error: any) {
      console.error("❌ Booking request failed:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.response?.data?.message,
        debug: error.response?.data?.debug,
        requestData: requestData,
      });
      throw error;
    }
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

  static async checkRoomBookingStatus(
    roomId: string
  ): Promise<RoomBookingStatus> {
    try {
      const response = await request.get(
        `/datphong/check-room-status/${roomId}`
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.warn("⚠️ API không trả về dữ liệu đúng format");
        return {
          isBooked: false,
          bookingInfo: null,
          message: "Không thể kiểm tra trạng thái phòng",
        };
      }
    } catch (error) {
      console.error(
        "❌ Lỗi trong DatPhongServices.checkRoomBookingStatus():",
        error
      );
      throw error;
    }
  }

  // API để lấy danh sách completed bookings
  static async getCompletedBookings(): Promise<CompletedBookingData[]> {
    try {
      const response = await request.get("/datphong/completed");
      if (response.data.success && response.data.data) {
        // Load thông tin review cho từng booking
        const bookingsWithReviews = await Promise.all(
          response.data.data.map(async (booking: CompletedBookingData) => {
            if (booking.hasReviewed) {
              try {
                const reviewResponse = await request.get(
                  `/danhgia/check-status/${booking.maDP}`
                );
                if (
                  reviewResponse.data.success &&
                  reviewResponse.data.data.review
                ) {
                  return {
                    ...booking,
                    review: reviewResponse.data.data.review,
                  };
                }
              } catch (error) {
                console.log("Error loading review for booking:", booking.maDP);
              }
            }
            return booking;
          })
        );
        return bookingsWithReviews;
      } else {
        console.warn("⚠️ API không trả về dữ liệu đúng format");
        return [];
      }
    } catch (error) {
      console.error(
        "❌ Lỗi trong DatPhongServices.getCompletedBookings():",
        error
      );
      throw error;
    }
  }

  // API để lấy completed bookings theo user ID
  static async getCompletedBookingsByUserId(
    userId: string
  ): Promise<CompletedBookingData[]> {
    try {
      const response = await request.get(`/datphong/completed/user/${userId}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.warn("⚠️ API không trả về dữ liệu đúng format");
        return [];
      }
    } catch (error) {
      console.error(
        "❌ Lỗi trong DatPhongServices.getCompletedBookingsByUserId():",
        error
      );
      throw error;
    }
  }

  // API để submit review từ completed booking
  static async submitReview(
    completedBookingId: string,
    rating: number,
    reviewText?: string
  ) {
    let reviewData: any = null;

    try {
      // Đọc completed booking từ JSON để lấy thông tin cần thiết
      const response = await request.get(`/datphong/completed`);
      const completedBookings = response.data.data || [];

      const completedBooking = completedBookings.find(
        (booking: any) => booking.maDP === completedBookingId
      );

      if (!completedBooking) {
        throw new Error("Không tìm thấy completed booking");
      }

      // Sử dụng API insert có sẵn
      reviewData = {
        maND: completedBooking.maND,
        maKS: completedBooking.maKS,
        maDatPhong: completedBooking.maDP,
        soSao: rating,
        binhLuan: reviewText || "",
        ngayDG: new Date().toISOString(),
      };

      const insertResponse = await request.post("/danhgia/insert", reviewData);
      return insertResponse.data;
    } catch (error: any) {
      console.error("❌ Lỗi trong DatPhongServices.submitReview():", error);
      console.error("❌ Review data:", reviewData);
      console.error("❌ Error response:", error.response?.data);
      throw error;
    }
  }

  // API để xác nhận thanh toán ATM
  static async confirmATMPayment(
    bookingId: string,
    transactionId?: string,
    amount?: number
  ) {
    try {
      const requestData = {
        bookingId,
        transactionId,
        amount,
      };

      console.log("🚀 Confirming ATM payment:", requestData);

      const response = await request.post(
        "/datphong/confirm-atm-payment",
        requestData
      );
      console.log("✅ ATM payment confirmation successful:", response.data);
      return response;
    } catch (error: any) {
      console.error("❌ ATM payment confirmation failed:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.response?.data?.message,
        requestData: { bookingId, transactionId, amount },
      });
      throw error;
    }
  }
}
