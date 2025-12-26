import request from '../utils/request';
import { DatPhong } from '../types';

export const datPhongService = {
  getAll: async (): Promise<DatPhong[]> => {
    const response = await request.get('/datphong/getall');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<DatPhong> => {
    const response = await request.get(`/datphong/getbyid/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<DatPhong>): Promise<DatPhong> => {
    const response = await request.post('/datphong/insert', data);
    return response.data.data;
  },

  update: async (data: Partial<DatPhong>): Promise<DatPhong> => {
    const response = await request.put('/datphong/update', data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/datphong/delete/${id}`);
  },

  search: async (keyword: string): Promise<DatPhong[]> => {
    const response = await request.get('/datphong/search', {
      params: { q: keyword },
    });
    return response.data.data || [];
  },

  getByUserId: async (userId: string): Promise<DatPhong[]> => {
    const response = await request.get(`/datphong/getbyuser/${userId}`);
    return response.data.data || [];
  },

  updateStatus: async (id: string, status: string): Promise<DatPhong> => {
    const response = await request.put(`/datphong/updatestatus/${id}`, { trangThai: status });
    return response.data.data;
  },

  calculatePrice: async (data: {
    roomId: string;
    checkInDateTime: string;
    checkOutDateTime: string;
    bookingType: string;
    duration?: number;
    promotionId?: string;
  }): Promise<{ basePrice: number; finalPrice: number; discount: number }> => {
    const response = await request.post('/datphong/calculate-price', data);
    return response.data.data;
  },

  checkAvailability: async (data: {
    roomId: string;
    checkInDateTime: string;
    checkOutDateTime: string;
  }): Promise<{ available: boolean; message: string }> => {
    const response = await request.get('/datphong/check-availability', {
      params: data,
    });
    return response.data.data;
  },

  confirmBooking: async (data: {
    roomId: string;
    hotelId: string;
    checkInDateTime: string;
    checkOutDateTime: string;
    bookingType: string;
    duration?: number;
    paymentMethod: string;
    clientCalculatedTotalAmount: number;
    promotionId?: string;
    bookerInfo?: {
      phoneNumber: string;
      name: string;
    };
  }): Promise<DatPhong> => {
    const response = await request.post('/datphong/confirm-booking', data);
    return response.data.data;
  },

  // API để lấy danh sách completed bookings
  getCompletedBookings: async (): Promise<any[]> => {
    const response = await request.get('/datphong/completed');
    return response.data.data || [];
  },

  // API để lấy completed bookings theo user ID
  getCompletedBookingsByUserId: async (userId: string): Promise<any[]> => {
    const response = await request.get(`/datphong/completed/user/${userId}`);
    return response.data.data || [];
  },

  // API để gửi email báo cáo đơn hoàn thành
  sendCompletedBookingsReportEmail: async (): Promise<{
    success: boolean;
    message: string;
    data?: {
      messageId: string;
      sentTo: string;
      bookingsCount: number;
      totalRevenue: number;
    };
  }> => {
    const response = await request.post('/datphong/completed/send-report');
    return response.data;
  },
};

