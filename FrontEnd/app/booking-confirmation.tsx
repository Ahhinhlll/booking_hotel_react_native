import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PhongServices } from '../../services/PhongServices';
import { KhachSanServices } from '../../services/KhachSanServices';
import { getImageUrl } from '../../utils/getImageUrl';

interface BookingData {
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

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  promotion?: string;
}

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [hotelInfo, setHotelInfo] = useState<any>(null);

  const paymentMethods: PaymentMethod[] = [
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

  useEffect(() => {
    if (params.bookingData) {
      try {
        const parsed = JSON.parse(params.bookingData as string);
        setBookingData(parsed);
        loadRoomAndHotelInfo(parsed.roomId, parsed.hotelId);
      } catch (error) {
        console.error('Error parsing booking data:', error);
        Alert.alert('Lỗi', 'Dữ liệu đặt phòng không hợp lệ');
        router.back();
      }
    }
  }, [params.bookingData]);

  const loadRoomAndHotelInfo = async (roomId: string, hotelId: string) => {
    try {
      const [room, hotel] = await Promise.all([
        PhongServices.getById(roomId),
        KhachSanServices.getById(hotelId),
      ]);
      setRoomInfo(room);
      setHotelInfo(hotel);
    } catch (error) {
      console.error('Error loading room and hotel info:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin phòng và khách sạn');
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const handleSelectPaymentMethod = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setShowPaymentModal(false);
  };

  const handleBookRoom = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Lỗi', 'Vui lòng chọn phương thức thanh toán');
      return;
    }

    if (!bookingData) {
      Alert.alert('Lỗi', 'Thiếu thông tin đặt phòng');
      return;
    }

    setLoading(true);

    try {
      // Gọi API đặt phòng với backend đã được sửa
      const response = await fetch('http://localhost:3000/api/bookings/confirm', {
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
          paymentMethod: selectedPaymentMethod,
          clientCalculatedTotalAmount: bookingData.totalAmount,
          promotionId: bookingData.promotionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đặt phòng thất bại');
      }

      const result = await response.json();
      
      Alert.alert(
        'Thành công',
        `Đặt phòng thành công!\nMã đặt phòng: ${result.bookingId}\nTổng tiền: ${formatCurrency(result.finalAmount)}`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/booking-success'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã có lỗi xảy ra khi đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find(method => method.id === selectedPaymentMethod);
  };

  if (!bookingData || !roomInfo || !hotelInfo) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận và thanh toán</Text>
      </View>

      <ScrollView style={styles.scrollViewContent}>
        {/* User Information */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>+84 387238815</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ tên</Text>
            <Text style={styles.infoValue}>Joyer.651</Text>
          </View>
        </View>

        {/* Promotion Section */}
        <TouchableOpacity style={styles.promoSection}>
          <View style={styles.promoLeft}>
            <Ionicons name="pricetag" size={20} color="#FB923C" />
            <Text style={styles.promoTitle}>Ưu đãi</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.promotionDetailBox}>
          <View style={styles.promotionDetailRow}>
            <View style={styles.promotionIconContainer}>
              <Text style={styles.promotionIconText}>J</Text>
            </View>
            <Text style={styles.promotionDetailText}>Joy Xu</Text>
          </View>
          <Text style={styles.promotionRequirementText}>
            Để dùng bạn cần tích luỹ ít nhất 50.000 Joy Xu
          </Text>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Chi tiết thanh toán</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tiền phòng</Text>
            <Text style={styles.infoValue}>{formatCurrency(bookingData.totalAmount)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tổng thanh toán</Text>
            <Text style={styles.infoValue}>{formatCurrency(bookingData.totalAmount)}</Text>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Chính sách hủy phòng</Text>
          <Text style={styles.policyText}>
            Hủy miễn phí trước 06:00, {bookingData.checkInDate} khi thanh toán trả trước.
          </Text>
          <View style={styles.tipBox}>
            <Ionicons name="bulb" size={16} color="#FB923C" />
            <Text style={styles.tipText}>
              Hãy lựa chọn phương thức thanh toán để xem chi tiết chính sách nhé.
            </Text>
          </View>
          <Text style={styles.agreementText}>
            Tôi đồng ý với{' '}
            <Text style={styles.linkText}>Điều khoản và Chính sách</Text> đặt phòng.
          </Text>
          <Text style={styles.supportText}>
            Dịch vụ hỗ trợ khách hàng -{' '}
            <Text style={styles.linkText}>Liên hệ ngay</Text>
          </Text>
        </View>

        {/* Payment Method */}
        <TouchableOpacity 
          style={styles.paymentSection}
          onPress={() => setShowPaymentModal(true)}
        >
          <View style={styles.paymentLeft}>
            <Ionicons name="card" size={20} color="#FB923C" />
            <Text style={styles.paymentTitle}>Chọn phương thức thanh toán</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        {selectedPaymentMethod && (
          <View style={styles.selectedPaymentBox}>
            <Text style={styles.selectedPaymentText}>
              Đã chọn: {getSelectedPaymentMethod()?.name}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Fixed Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Tổng thanh toán</Text>
          <Text style={styles.totalAmount}>{formatCurrency(bookingData.totalAmount)}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.bookButton, loading && styles.bookButtonDisabled]} 
          onPress={handleBookRoom}
          disabled={loading}
        >
          <Text style={styles.bookButtonText}>
            {loading ? 'Đang xử lý...' : 'Đặt phòng'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Phương thức thanh toán</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.paymentMethodsList}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={styles.paymentMethodItem}
                  onPress={() => handleSelectPaymentMethod(method.id)}
                >
                  <View style={styles.paymentMethodLeft}>
                    <View style={[styles.paymentMethodIcon, { backgroundColor: method.color }]}>
                      <Ionicons name={method.icon as any} size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                  </View>
                  <View style={styles.radioButton}>
                    {selectedPaymentMethod === method.id && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    flex: 1,
    textAlign: 'center' as const,
    marginRight: 34,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  promoSection: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  promoLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginLeft: 8,
  },
  promotionDetailBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  promotionDetailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  promotionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 8,
  },
  promotionIconText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#4B5563',
  },
  promotionDetailText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  promotionRequirementText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 32,
  },
  policyText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 20,
  },
  tipBox: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FEF3E7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 12,
    color: '#FB923C',
    marginLeft: 8,
    flex: 1,
  },
  agreementText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkText: {
    color: '#FB923C',
    textDecorationLine: 'underline' as const,
  },
  paymentSection: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginLeft: 8,
  },
  selectedPaymentBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  selectedPaymentText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600' as const,
  },
  bottomBar: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  bookButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  bookButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  modalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  paymentMethodsList: {
    maxHeight: 400,
  },
  paymentMethodItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  paymentMethodLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500' as const,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  confirmButton: {
    backgroundColor: '#FB923C',
    paddingVertical: 16,
    margin: 16,
    borderRadius: 10,
    alignItems: 'center' as const,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
};
