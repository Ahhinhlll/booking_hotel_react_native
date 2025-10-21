import request from "../utils/request";

export interface ReviewData {
  maDG: string;
  maND: string;
  maKS: string;
  maDatPhong: string;
  soSao: number;
  binhLuan: string;
  ngayDG: string;
  NguoiDung?: {
    hoTen: string;
    email: string;
  };
  DatPhong?: {
    maDatPhong: string;
    Phong?: {
      tenPhong: string;
    };
  };
}

export class DanhGiaServices {
  // API để lấy reviews theo hotel ID
  static async getReviewsByHotelId(hotelId: string): Promise<ReviewData[]> {
    try {
      const response = await request.get(`/danhgia/hotel/${hotelId}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.warn("⚠️ API không trả về dữ liệu đúng format");
        return [];
      }
    } catch (error) {
      console.error("❌ Lỗi trong DanhGiaServices.getReviewsByHotelId():", error);
      throw error;
    }
  }

  // API để submit review từ completed booking
  static async submitReview(completedBookingId: string, rating: number, reviewText?: string) {
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
      const reviewData = {
        maND: completedBooking.maND,
        maKS: completedBooking.maKS,
        maDatPhong: completedBooking.maDP,
        soSao: rating,
        binhLuan: reviewText || "",
        ngayDG: new Date().toISOString()
      };
      
      const insertResponse = await request.post("/danhgia/insert", reviewData);
      return insertResponse.data;
    } catch (error) {
      console.error("❌ Lỗi trong DanhGiaServices.submitReview():", error);
      throw error;
    }
  }

  // API để lấy review theo mã đặt phòng
  static async getReviewByBookingId(bookingId: string): Promise<ReviewData | null> {
    try {
      const response = await request.get(`/danhgia/check-status/${bookingId}`);
      if (response.data.success && response.data.data.review) {
        return response.data.data.review;
      }
      return null;
    } catch (error) {
      console.error("❌ Lỗi trong DanhGiaServices.getReviewByBookingId():", error);
      return null;
    }
  }

  // API để cập nhật review
  static async updateReview(reviewId: string, rating: number, reviewText?: string) {
    try {
      const updateData: any = {
        maDG: reviewId,
        soSao: rating,
        ngayDG: new Date().toISOString()
      };
      
      if (reviewText !== undefined) {
        updateData.binhLuan = reviewText;
      }
      
      const response = await request.put(`/danhgia/update`, updateData);
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi trong DanhGiaServices.updateReview():", error);
      throw error;
    }
  }

  // API để xóa review
  static async deleteReview(reviewId: string) {
    try {
      const response = await request.delete(`/danhgia/delete/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi trong DanhGiaServices.deleteReview():", error);
      throw error;
    }
  }
}
