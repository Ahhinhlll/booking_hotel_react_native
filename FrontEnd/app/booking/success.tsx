import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [bookingInfo, setBookingInfo] = useState<any>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Animation khi component mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Lấy thông tin booking từ params hoặc từ storage
    if (params.bookingData) {
      try {
        const parsed = JSON.parse(params.bookingData as string);
        setBookingInfo(parsed);
      } catch (error) {
        console.error("Error parsing booking data:", error);
      }
    } else {
      console.log("❌ No bookingData in params:", params);
    }
  }, [params.bookingData]);

  const handleConfirmAndGoHome = () => {
    // Chuyển về trang chủ trực tiếp
    router.push("/(tabs)" as any);
  };

  const handleViewBooking = () => {
    router.push("/(tabs)/booked");
  };

  if (!bookingInfo) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#FF8C42", "#FF6B35", "#FFA726"]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Success Icon với animation */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name="checkmark-circle" size={100} color="#FFFFFF" />
            </View>
            <View style={styles.iconGlow} />
          </View>

          {/* Title và Subtitle */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Đặt phòng thành công!</Text>
            <Text style={styles.subtitle}>
              Chúng tôi đã gửi thông tin đặt phòng đến email của bạn.{"\n"}
              Vui lòng kiểm tra email để xem chi tiết đặt phòng.
            </Text>
          </View>

          {/* Thông tin booking với design đẹp hơn */}
          <View style={styles.infoBox}>
            <View style={styles.infoHeader}>
              <Ionicons name="receipt-outline" size={24} color="#FF6B35" />
              <Text style={styles.infoTitle}>Thông tin đặt phòng</Text>
            </View>

            <View style={styles.infoContent}>
              <View style={styles.infoRow}>
                <Ionicons name="card-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Mã đặt phòng:</Text>
                <Text style={styles.infoValue}>
                  {typeof (
                    bookingInfo?.maDatPhong || bookingInfo?.bookingId
                  ) === "string" ||
                  typeof (bookingInfo?.maDatPhong || bookingInfo?.bookingId) ===
                    "number"
                    ? bookingInfo?.maDatPhong ||
                      bookingInfo?.bookingId ||
                      "#BK123456"
                    : "#BK123456"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Khách hàng:</Text>
                <Text style={styles.infoValue}>
                  {typeof (bookingInfo?.hoTen || bookingInfo?.tenNguoiDat) ===
                    "string" ||
                  typeof (bookingInfo?.hoTen || bookingInfo?.tenNguoiDat) ===
                    "number"
                    ? bookingInfo?.hoTen ||
                      bookingInfo?.tenNguoiDat ||
                      "Khách hàng"
                    : "Khách hàng"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Số điện thoại:</Text>
                <Text style={styles.infoValue}>
                  {typeof (
                    bookingInfo?.sdt ||
                    bookingInfo?.bookerInfo?.phoneNumber ||
                    bookingInfo?.sdtNguoiDat
                  ) === "string" ||
                  typeof (
                    bookingInfo?.sdt ||
                    bookingInfo?.bookerInfo?.phoneNumber ||
                    bookingInfo?.sdtNguoiDat
                  ) === "number"
                    ? bookingInfo?.sdt ||
                      bookingInfo?.bookerInfo?.phoneNumber ||
                      bookingInfo?.sdtNguoiDat ||
                      "Chưa cập nhật"
                    : "Chưa cập nhật"}
                </Text>
              </View>

              {/* Tổng tiền gốc - ĐÃ SỬA */}
              {(bookingInfo?.totalAmount && bookingInfo.totalAmount > 0) ||
              (bookingInfo?.basePrice && bookingInfo.basePrice > 0) ? (
                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={20} color="#6B7280" />
                  <Text style={styles.infoLabel}>Tổng tiền gốc:</Text>
                  <Text style={styles.infoValue}>
                    {typeof (
                      bookingInfo?.totalAmount ||
                      bookingInfo?.basePrice ||
                      0
                    ) === "number"
                      ? (
                          bookingInfo?.totalAmount ||
                          bookingInfo?.basePrice ||
                          0
                        ).toLocaleString("vi-VN")
                      : "0"}
                    {" ₫"}
                  </Text>
                </View>
              ) : null}

              {/* Tổng tiền sau giảm giá - ĐÃ SỬA */}
              {bookingInfo?.finalAmount || bookingInfo?.finalPrice ? (
                <View style={styles.infoRow}>
                  <Ionicons name="card-outline" size={20} color="#10B981" />
                  <Text style={styles.infoLabel}>Tổng tiền sau giảm:</Text>
                  <Text style={[styles.infoValue, styles.discountedPrice]}>
                    {typeof (
                      bookingInfo?.finalAmount ||
                      bookingInfo?.finalPrice ||
                      0
                    ) === "number"
                      ? (
                          bookingInfo?.finalAmount ||
                          bookingInfo?.finalPrice ||
                          0
                        ).toLocaleString("vi-VN")
                      : "0"}
                    {" ₫"}
                  </Text>
                </View>
              ) : null}

              {/* Thông tin giảm giá - ĐÃ SỬA */}
              {(bookingInfo?.discountAmount ||
                bookingInfo?.promotionDiscount) &&
              (bookingInfo?.discountAmount > 0 ||
                bookingInfo?.promotionDiscount > 0) ? (
                <View style={styles.infoRow}>
                  <Ionicons name="gift-outline" size={20} color="#F59E0B" />
                  <Text style={styles.infoLabel}>Tiết kiệm:</Text>
                  <Text style={[styles.infoValue, styles.savingsText]}>
                    {"-"}
                    {typeof (
                      bookingInfo?.discountAmount ||
                      bookingInfo?.promotionDiscount ||
                      0
                    ) === "number"
                      ? (
                          bookingInfo?.discountAmount ||
                          bookingInfo?.promotionDiscount ||
                          0
                        ).toLocaleString("vi-VN")
                      : "0"}
                    {" ₫"}
                  </Text>
                </View>
              ) : null}

              {/* Thông tin promotion - ĐÃ SỬA */}
              {bookingInfo?.promotionName ? (
                <View style={styles.infoRow}>
                  <Ionicons name="star-outline" size={20} color="#F59E0B" />
                  <Text style={styles.infoLabel}>Ưu đãi:</Text>
                  <Text style={[styles.infoValue, styles.savingsText]}>
                    {typeof bookingInfo?.promotionName === "string" ||
                    typeof bookingInfo?.promotionName === "number"
                      ? bookingInfo?.promotionName
                      : "Ưu đãi"}
                  </Text>
                </View>
              ) : null}

              {/* Fallback nếu không có dữ liệu - (Block này đã an toàn, không cần sửa) */}
              {!bookingInfo?.finalAmount &&
                !bookingInfo?.finalPrice &&
                !bookingInfo?.totalAmount &&
                !bookingInfo?.basePrice && (
                  <View style={styles.infoRow}>
                    <Ionicons name="cash-outline" size={20} color="#6B7280" />
                    <Text style={styles.infoLabel}>Tổng tiền:</Text>
                    <Text style={styles.infoValue}>Chưa xác định</Text>
                  </View>
                )}

              <View style={styles.infoRow}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#10B981"
                />
                <Text style={styles.infoLabel}>Trạng thái:</Text>
                <Text style={[styles.infoValue, styles.statusConfirmed]}>
                  {typeof bookingInfo?.status === "string"
                    ? bookingInfo?.status
                    : "Đã xác nhận"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="wallet-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Thanh toán:</Text>
                <Text style={styles.infoValue}>
                  {typeof bookingInfo?.paymentMethod === "string"
                    ? bookingInfo?.paymentMethod === "atm"
                      ? "ATM/Ngân hàng"
                      : bookingInfo?.paymentMethod === "momo"
                        ? "MoMo"
                        : bookingInfo?.paymentMethod === "zalopay"
                          ? "ZaloPay"
                          : bookingInfo?.paymentMethod === "hotel"
                            ? "Thanh toán tại khách sạn"
                            : bookingInfo?.paymentMethod
                    : "Chưa xác định"}
                </Text>
              </View>

              {/* CheckInDateTime - ĐÃ SỬA */}
              {bookingInfo?.checkInDateTime ? (
                <View style={styles.infoRow}>
                  <Ionicons name="log-in-outline" size={20} color="#6B7280" />
                  <Text style={styles.infoLabel}>Nhận phòng:</Text>
                  <Text style={styles.infoValue}>
                    {typeof bookingInfo?.checkInDateTime === "string" ||
                    typeof bookingInfo?.checkInDateTime === "number"
                      ? new Date(bookingInfo?.checkInDateTime).toLocaleString(
                          "vi-VN"
                        )
                      : "Chưa xác định"}
                  </Text>
                </View>
              ) : null}

              {/* CheckOutDateTime - ĐÃ SỬA */}
              {bookingInfo?.checkOutDateTime ? (
                <View style={styles.infoRow}>
                  <Ionicons name="log-out-outline" size={20} color="#6B7280" />
                  <Text style={styles.infoLabel}>Trả phòng:</Text>
                  <Text style={styles.infoValue}>
                    {typeof bookingInfo?.checkOutDateTime === "string" ||
                    typeof bookingInfo?.checkOutDateTime === "number"
                      ? new Date(bookingInfo?.checkOutDateTime).toLocaleString(
                          "vi-VN"
                        )
                      : "Chưa xác định"}
                  </Text>
                </View>
              ) : null}

              {/* BookingType - ĐÃ SỬA */}
              {bookingInfo?.bookingType ? (
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                  <Text style={styles.infoLabel}>Loại đặt:</Text>
                  <Text style={styles.infoValue}>
                    {typeof bookingInfo?.bookingType === "string"
                      ? bookingInfo?.bookingType === "hourly"
                        ? "Theo giờ"
                        : bookingInfo?.bookingType === "overnight"
                          ? "Qua đêm"
                          : bookingInfo?.bookingType === "daily"
                            ? "Theo ngày"
                            : bookingInfo?.bookingType
                      : bookingInfo?.bookingType || "Chưa xác định"}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleConfirmAndGoHome}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF6B35", "#FF8C42"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="home-outline" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Về trang chủ</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleViewBooking}
              activeOpacity={0.8}
            >
              <Ionicons name="list-outline" size={20} color="#FF6B35" />
              <Text style={styles.secondaryButtonText}>Xem đơn đặt phòng</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  iconGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 5,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoBox: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    marginBottom: 32,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 53, 0.1)",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 107, 53, 0.15)",
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 12,
  },
  infoContent: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
    flex: 1,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  statusConfirmed: {
    color: "#10B981",
    fontWeight: "700",
  },
  discountedPrice: {
    color: "#10B981",
    fontWeight: "700",
    fontSize: 16,
  },
  savingsText: {
    color: "#F59E0B",
    fontWeight: "700",
    fontSize: 14,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 107, 53, 0.3)",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
