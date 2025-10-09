// Booking Services
export interface BookingData {
  roomId: string;
  hotelId: string;
  checkInTime: string;
  checkOutTime: string;
  checkInDate: string;
  checkOutDate: string;
  duration: number;
  bookingType: string;
  totalAmount: number;
  promotionId?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  promotion?: string;
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  finalAmount?: number;
  basePrice?: number;
  discountAmount?: number;
  paymentStatus?: string;
  paymentMessage?: string;
  promotion?: {
    name: string;
    discount: number;
  };
  message: string;
}

export class BookingServices {
  private static baseUrl = 'http://localhost:3000/api/bookings';

  // Xác nhận đặt phòng và xử lý thanh toán
  static async confirmBooking(bookingData: BookingData, paymentMethod: string): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: bookingData.roomId,
          hotelId: bookingData.hotelId,
          checkInDateTime: `${bookingData.checkInDate} ${bookingData.checkInTime}`,
          checkOutDateTime: `${bookingData.checkOutDate} ${bookingData.checkOutTime}`,
          bookingType: bookingData.bookingType,
          duration: bookingData.duration,
          paymentMethod: paymentMethod,
          clientCalculatedTotalAmount: bookingData.totalAmount,
          promotionId: bookingData.promotionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đặt phòng thất bại');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Đã có lỗi xảy ra khi đặt phòng');
    }
  }

  // Tính giá trước khi đặt phòng
  static async calculatePrice(roomId: string, bookingType: string, duration: number, promotionId?: string) {
    try {
      const response = await fetch(`${this.baseUrl}/calculate-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          bookingType,
          duration,
          promotionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Tính giá thất bại');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Đã có lỗi xảy ra khi tính giá');
    }
  }

  // Kiểm tra tính khả dụng của phòng
  static async checkAvailability(roomId: string, checkInDateTime: string, checkOutDateTime: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/check-availability?roomId=${roomId}&checkInDateTime=${checkInDateTime}&checkOutDateTime=${checkOutDateTime}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kiểm tra tính khả dụng thất bại');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Đã có lỗi xảy ra khi kiểm tra tính khả dụng');
    }
  }
}

// Payment Methods Data
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'momo',
    name: 'Ví MoMo',
    icon: 'card',
    color: '#D82D8B',
  },
  {
    id: 'zalopay',
    name: 'Ví ZaloPay',
    icon: 'card',
    color: '#0068FF',
    promotion: 'Nhập mã SALEZLP để được giảm giá cho đơn từ 150K',
  },
  {
    id: 'shopeepay',
    name: 'Ví ShopeePay',
    icon: 'card',
    color: '#EE4D2D',
    promotion: 'Ưu đãi ShopeePay giảm đến 50.000₫',
  },
  {
    id: 'credit',
    name: 'Thẻ Credit',
    icon: 'card',
    color: '#1F2937',
  },
  {
    id: 'atm',
    name: 'Thẻ ATM',
    icon: 'card',
    color: '#3B82F6',
  },
  {
    id: 'hotel',
    name: 'Trả tại khách sạn',
    icon: 'business',
    color: '#6B7280',
  },
];

// Utility Functions
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('vi-VN') + '₫';
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
