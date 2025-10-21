import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
  Alert,
  Clipboard,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VietQRService, VietQRPaymentData } from "../services/VietQRService";

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  paymentData: VietQRPaymentData;
  bookingInfo?: {
    roomId: string;
    hotelId: string;
    bookingId?: string;
    customerName?: string;
    roomName?: string;
    hotelName?: string;
    totalAmount?: number;
  };
  onPaymentConfirmed?: (bookingId: string) => void;
}

export default function QRCodeModal({
  visible,
  onClose,
  paymentData,
  bookingInfo,
  onPaymentConfirmed,
}: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const qrCodeData = VietQRService.generateQRCodeData(paymentData);

  const handleCopyAccountNumber = async () => {
    try {
      await Clipboard.setString(qrCodeData.accountNumber);
      setCopied(true);
      Alert.alert("Thành công", "Đã sao chép số tài khoản");

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể sao chép số tài khoản");
    }
  };

  const handleCopyAmount = async () => {
    try {
      await Clipboard.setString(qrCodeData.amount.toString());
      Alert.alert("Thành công", "Đã sao chép số tiền");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể sao chép số tiền");
    }
  };

  const formatAmount = (amount: number) => {
    return `${VietQRService.formatAmount(amount)}₫`;
  };

  const handleConfirmPayment = async () => {
    if (
      !bookingInfo?.bookingId ||
      bookingInfo.bookingId === "temp-booking-id"
    ) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin booking. Vui lòng thử lại sau khi booking được tạo thành công.",
        [
          {
            text: "OK",
            onPress: () => onClose(),
          },
        ]
      );
      return;
    }

    // Chuyển sang trang success luôn mà không cần xác nhận
    onPaymentConfirmed?.(bookingInfo.bookingId!);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="qr-code" size={24} color="#FFFFFF" />
              <Text style={styles.title}>Thanh toán ATM</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Booking Info */}
            <View style={styles.bookingCard}>
              <Text style={styles.cardTitle}>Thông tin đặt phòng</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Khách sạn:</Text>
                <Text style={styles.infoValue}>
                  {bookingInfo?.hotelName || "Đang cập nhật"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phòng:</Text>
                <Text style={styles.infoValue}>
                  {bookingInfo?.roomName || "Đang cập nhật"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Khách hàng:</Text>
                <Text style={styles.infoValue}>
                  {bookingInfo?.customerName || "Khách hàng"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tổng tiền:</Text>
                <Text style={styles.totalAmount}>
                  {formatAmount(bookingInfo?.totalAmount || paymentData.amount)}
                </Text>
              </View>
            </View>

            {/* QR Code */}
            <View style={styles.qrSection}>
              <View style={styles.qrWrapper}>
                <Image
                  source={{ uri: qrCodeData.qrUrl }}
                  style={styles.qrCode}
                  resizeMode="contain"
                  onError={(error) => {
                    console.log("QR Code load error:", error.nativeEvent.error);
                    Alert.alert(
                      "Lỗi",
                      "Không thể tải QR code. Vui lòng thử lại."
                    );
                  }}
                />
              </View>
              <Text style={styles.qrTitle}>Quét mã QR để thanh toán</Text>
              <Text style={styles.qrSubtitle}>
                Sử dụng ứng dụng ngân hàng để quét
              </Text>
            </View>

            {/* Payment Details */}
            <View style={styles.paymentCard}>
              <Text style={styles.cardTitle}>Thông tin chuyển khoản</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ngân hàng:</Text>
                <Text style={styles.detailValue}>MBBANK</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Số tài khoản:</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyAccountNumber}
                >
                  <Text style={styles.detailValue}>
                    {qrCodeData.accountNumber}
                  </Text>
                  <Ionicons name="copy" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tên tài khoản:</Text>
                <Text style={styles.detailValue}>{qrCodeData.accountName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Số tiền:</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyAmount}
                >
                  <Text style={styles.amountText}>
                    {formatAmount(qrCodeData.amount)}
                  </Text>
                  <Ionicons name="copy" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {qrCodeData.addInfo && qrCodeData.addInfo.trim() !== "" && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nội dung:</Text>
                  <Text style={styles.addInfoText}>{qrCodeData.addInfo}</Text>
                </View>
              )}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <Text style={styles.cardTitle}>Hướng dẫn thanh toán</Text>
              <Text style={styles.stepText}>
                1. Mở ứng dụng ngân hàng trên điện thoại
              </Text>
              <Text style={styles.stepText}>
                2. Chọn Quét mã QR hoặc Chuyển khoản
              </Text>
              <Text style={styles.stepText}>
                3. Quét mã QR ở trên hoặc nhập thông tin
              </Text>
              <Text style={styles.stepText}>
                4. Kiểm tra thông tin và xác nhận thanh toán
              </Text>
              <Text style={styles.stepText}>
                5. Nhấn Đã thanh toán bên dưới
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Ionicons name="close" size={18} color="#6B7280" />
              <Text style={styles.cancelButtonText}>Đóng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmPayment}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.confirmButtonText}>Đã thanh toán</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    height: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  // Header
  header: {
    backgroundColor: "#FB923C",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
  },

  // Scroll content
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Cards
  bookingCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  paymentCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  instructionsCard: {
    backgroundColor: "#FEF3E7",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    textAlign: "right",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FB923C",
    flex: 1,
    textAlign: "right",
  },

  // QR Section
  qrSection: {
    alignItems: "center",
    marginVertical: 16,
  },
  qrWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  qrCode: {
    width: 180,
    height: 180,
    borderRadius: 8,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    textAlign: "center",
  },
  qrSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },

  // Payment details
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FB923C",
    marginRight: 8,
  },
  addInfoText: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "right",
    flex: 1,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Instructions
  stepText: {
    fontSize: 14,
    color: "#92400E",
    marginBottom: 8,
    lineHeight: 20,
  },

  // Debug info
  debugInfo: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  debugText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "monospace",
    marginBottom: 2,
  },

  // Footer
  footer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#F8FAFC",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 6,
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FB923C",
    shadowColor: "#FB923C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 6,
  },
});
