import request from "../utils/request";

interface MoMoPaymentRequest {
  bookingId: string | number;
  amount: number;
  orderInfo?: string;
}

interface MoMoPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    payUrl: string;
    qrCodeUrl?: string;
    deeplink?: string;
    orderId: string;
    requestId: string;
  };
  resultCode?: number;
}

interface MoMoStatusRequest {
  orderId: string;
}

interface MoMoStatusResponse {
  success: boolean;
  data?: {
    resultCode: number;
    message: string;
    transId?: number;
    amount?: number;
    payType?: string;
  };
}

const MoMoServices = {
  /**
   * Tạo link thanh toán MoMo
   */
  createPayment: async (data: MoMoPaymentRequest): Promise<MoMoPaymentResponse> => {
    const response = await request.post<MoMoPaymentResponse>("/momo/create-payment", data);
    return response.data;
  },

  /**
   * Kiểm tra trạng thái giao dịch
   */
  checkStatus: async (data: MoMoStatusRequest): Promise<MoMoStatusResponse> => {
    const response = await request.post<MoMoStatusResponse>("/momo/check-status", data);
    return response.data;
  },
};

export default MoMoServices;
