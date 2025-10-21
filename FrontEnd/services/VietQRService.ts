export interface VietQRConfig {
  templateId: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

export interface VietQRPaymentData {
  amount: number;
  addInfo?: string;
  accountName?: string;
}

export class VietQRService {
  private static readonly BASE_URL = 'https://api.vietqr.io/image';
  private static readonly DEFAULT_CONFIG: VietQRConfig = {
    templateId: 'ayXKCCn',
    accountNumber: '0387238815',
    accountName: 'LUONG THANH BINH',
    bankCode: '970422'
  };

  /**
   * Tạo URL VietQR cho thanh toán ATM
   * @param paymentData - Thông tin thanh toán
   * @param config - Cấu hình VietQR (optional)
   * @returns URL của QR code
   */
  static generatePaymentURL(
    paymentData: VietQRPaymentData,
    config: Partial<VietQRConfig> = {}
  ): string {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    const params = new URLSearchParams({
      accountName: paymentData.accountName || finalConfig.accountName,
      amount: paymentData.amount.toString(),
      addInfo: paymentData.addInfo || 'Thanh toan khach san'
    });

    return `${this.BASE_URL}/${finalConfig.bankCode}-${finalConfig.accountNumber}-${finalConfig.templateId}.jpg?${params.toString()}`;
  }

  /**
   * Tạo QR code data cho thanh toán
   * @param paymentData - Thông tin thanh toán
   * @param config - Cấu hình VietQR (optional)
   * @returns Object chứa URL và thông tin QR code
   */
  static generateQRCodeData(
    paymentData: VietQRPaymentData,
    config: Partial<VietQRConfig> = {}
  ) {
    const qrUrl = this.generatePaymentURL(paymentData, config);
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    return {
      qrUrl,
      accountNumber: finalConfig.accountNumber,
      accountName: finalConfig.accountName,
      bankCode: finalConfig.bankCode,
      amount: paymentData.amount,
      addInfo: paymentData.addInfo || 'Thanh toan khach san'
    };
  }

  /**
   * Format số tiền theo định dạng Việt Nam
   * @param amount - Số tiền
   * @returns Chuỗi số tiền đã format
   */
  static formatAmount(amount: number): string {
    return amount.toLocaleString('vi-VN');
  }

  /**
   * Tạo thông tin thanh toán cho booking
   * @param bookingData - Thông tin booking
   * @param customerName - Tên khách hàng
   * @returns Thông tin thanh toán VietQR
   */
  static createBookingPaymentData(
    bookingData: {
      totalAmount: number;
      roomId: string;
      hotelId: string;
      bookingId?: string;
    },
    customerName?: string
  ): VietQRPaymentData {
    const addInfo = `Thanh toan phong ${bookingData.roomId} - Booking ${bookingData.bookingId || 'N/A'}`;
    
    return {
      amount: bookingData.totalAmount,
      addInfo,
      accountName: customerName || 'Khach hang'
    };
  }
}
