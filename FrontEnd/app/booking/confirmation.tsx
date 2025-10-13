import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  Image,
  TextInput,
  Modal,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PhongServices } from "../../services/PhongServices";
import { KhachSanServices } from "../../services/KhachSanServices";
import { DatPhongServices, BookingData } from "../../services/DatPhongServices";
import PaymentMethodModal from "../../components/PaymentMethodModal";
import { getImageUrl } from "../../utils/getImageUrl";
import { NguoiDungServices } from "../../services/NguoiDungServices";
import {
  KhuyenMaiServices,
  KhuyenMaiData,
} from "../../services/KhuyenMaiServices";

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [hotelInfo, setHotelInfo] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    hoTen: "",
    sdt: "",
    email: "",
  });
  const [showPromotionsModal, setShowPromotionsModal] = useState(false);
  const [promotions, setPromotions] = useState<KhuyenMaiData[]>([]);
  const [selectedPromotion, setSelectedPromotion] =
    useState<KhuyenMaiData | null>(null);
  const [finalPrice, setFinalPrice] = useState<number>(0);

  useEffect(() => {
    if (params.bookingData) {
      try {
        const parsed = JSON.parse(params.bookingData as string);
        setBookingData(parsed);
        loadRoomAndHotelInfo(parsed.roomId, parsed.hotelId);
        loadUserInfo();
        loadPromotions();
      } catch (error) {
        console.error("Error parsing booking data:", error);
        Alert.alert("Lỗi", "Dữ liệu đặt phòng không hợp lệ");
        router.back();
      }
    }
  }, [params.bookingData]);

  // Tính lại giá khi có thay đổi bookingData hoặc selectedPromotion
  useEffect(() => {
    if (bookingData) {
      const calculatedPrice = calculatePriceWithPromotion(bookingData.totalAmount);
      setFinalPrice(calculatedPrice);
    }
  }, [bookingData, selectedPromotion]);

  const loadRoomAndHotelInfo = async (roomId: string, hotelId: string) => {
    try {
      // Load room data first
      const room = await PhongServices.getById(roomId);
      console.log("Room data loaded:", room);
      console.log("Room image path:", room?.anh);
      console.log("Generated image URL:", getImageUrl(room?.anh));
      setRoomInfo(room);

      // Try to load hotel data
      let hotel = null;
      try {
        hotel = await KhachSanServices.getById(hotelId);
        setHotelInfo(hotel);
      } catch (hotelError) {
        setHotelInfo(hotel);
      }
    } catch (error) {
      console.error("Error loading room and hotel info:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin phòng và khách sạn");
    }
  };

  const loadUserInfo = async () => {
    try {
      // Lấy thông tin người dùng từ token
      const user = await NguoiDungServices.getCurrentUser();

      if (user) {
        setUserInfo(user);
        setEditForm({
          hoTen: user.hoTen || "",
          sdt: user.sdt || "",
          email: user.email || "",
        });
      } else {
        // Nếu không có token hoặc token không hợp lệ
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
        router.replace("/auth/login"); // Redirect về trang login
      }
    } catch (error) {
      console.error("Error loading user info:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng");
      router.replace("/auth/login"); // Redirect về trang login
    }
  };

  const loadPromotions = async () => {
    try {
      const data = await KhuyenMaiServices.getAll();
      setPromotions(data || []);
    } catch (error) {
      console.error("Error loading promotions:", error);
    }
  };

  const handleViewPromotions = () => {
    setShowPromotionsModal(true);
  };

  const handleClearPromotion = () => {
    setSelectedPromotion(null);
  };

  const handleSelectPromotion = (promotion: KhuyenMaiData) => {
    console.log("Selecting promotion:", promotion);
    console.log("Promotion details:", {
      maKM: promotion.maKM,
      tenKM: promotion.tenKM,
      thongTinKM: promotion.thongTinKM,
      phanTramGiam: promotion.phanTramGiam,
      giaTriGiam: promotion.giaTriGiam,
      ngayBatDau: promotion.ngayBatDau,
      ngayKetThuc: promotion.ngayKetThuc
    });

    // Nếu đã chọn khuyến mãi này rồi thì bỏ chọn
    if (selectedPromotion?.maKM === promotion.maKM) {
      setSelectedPromotion(null);
    } else {
      // Nếu chưa chọn hoặc chọn khuyến mãi khác thì chọn khuyến mãi mới
      setSelectedPromotion(promotion);
    }

    setShowPromotionsModal(false);
  };

  const calculatePriceWithPromotion = (basePrice: number) => {
    if (!selectedPromotion) {
      return basePrice;
    }

    console.log("Calculating price with promotion:", {
      basePrice,
      promotion: selectedPromotion,
      phanTramGiam: selectedPromotion.phanTramGiam,
      giaTriGiam: selectedPromotion.giaTriGiam,
      thongTinKM: selectedPromotion.thongTinKM,
    });

    let finalPrice = basePrice;
    let discountAmount = 0;

    // Sử dụng cùng logic với backend
    if (selectedPromotion.phanTramGiam && selectedPromotion.phanTramGiam > 0) {
      discountAmount = Math.round((basePrice * selectedPromotion.phanTramGiam) / 100);
      finalPrice = basePrice - discountAmount;
      console.log("Percentage discount:", {
        basePrice,
        phanTramGiam: selectedPromotion.phanTramGiam,
        discountAmount,
        finalPrice
      });
    } else if (selectedPromotion.giaTriGiam && selectedPromotion.giaTriGiam > 0) {
      discountAmount = selectedPromotion.giaTriGiam;
      finalPrice = basePrice - discountAmount;
      console.log("Fixed amount discount:", {
        basePrice,
        giaTriGiam: selectedPromotion.giaTriGiam,
        discountAmount,
        finalPrice
      });
    } else if (selectedPromotion.thongTinKM) {
      // Parse từ text như "giảm 30K" -> 30000
      const discountMatch = selectedPromotion.thongTinKM.match(/giảm\s*(\d+)k/i);
      if (discountMatch) {
        discountAmount = parseInt(discountMatch[1]) * 1000; // Convert to VND
        finalPrice = basePrice - discountAmount;
        console.log("Text-based discount:", {
          basePrice,
          thongTinKM: selectedPromotion.thongTinKM,
          discountAmount,
          finalPrice
        });
      }
    }

    finalPrice = Math.max(Math.round(finalPrice), 0); // Làm tròn và không cho phép giá âm
    
    console.log("Final discount calculation:", { 
      basePrice, 
      finalPrice, 
      discountAmount: basePrice - finalPrice 
    });
    
    return finalPrice;
  };

  const getPromotionText = () => {
    if (!selectedPromotion) return null;
    return selectedPromotion.thongTinKM || "Đã áp dụng khuyến mãi";
  };

  const getDurationText = () => {
    if (!bookingData) return "02 giờ";
    
    switch (bookingData.bookingType) {
      case "hourly":
        return `${bookingData.duration} giờ`;
      case "overnight":
        return "1 đêm";
      case "daily":
        return `${bookingData.duration} ngày`;
      default:
        return `${bookingData.duration} giờ`;
    }
  };

  const getDurationIcon = () => {
    if (!bookingData) return "time";
    
    switch (bookingData.bookingType) {
      case "hourly":
        return "hourglass";
      case "overnight":
        return "moon";
      case "daily":
        return "business";
      default:
        return "time";
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("vi-VN")}₫`;
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const time = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateStr = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${time} • ${dateStr}`;
  };

  const handleSelectPaymentMethod = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setShowPaymentModal(false);
  };

  const handleEditUserInfo = () => {
    setShowEditModal(true);
  };

  const handleSaveUserInfo = async () => {
    try {
      // Validation
      if (!editForm.hoTen.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập họ tên");
        return;
      }

      if (!editForm.sdt.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
        return;
      }

      if (!editForm.email.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập email");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        Alert.alert("Lỗi", "Email không đúng định dạng");
        return;
      }

      // Validate phone format
      const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8}$/;
      if (!phoneRegex.test(editForm.sdt.replace(/\s/g, ""))) {
        Alert.alert("Lỗi", "Số điện thoại không đúng định dạng");
        return;
      }

      setLoading(true);

      // Lấy thông tin người dùng hiện tại để có userId
      const currentUser = await NguoiDungServices.getCurrentUser();

      if (!currentUser) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
        return;
      }

      await NguoiDungServices.update({
        maNguoiDung: currentUser.maNguoiDung,
        hoTen: editForm.hoTen.trim(),
        sdt: editForm.sdt.trim(),
        email: editForm.email.trim(),
      });

      // Cập nhật state
      setUserInfo((prev: any) => ({ ...prev, ...editForm }));
      setShowEditModal(false);

      Alert.alert("Thành công", "Cập nhật thông tin thành công");
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (!bookingData) {
      Alert.alert("Lỗi", "Thiếu thông tin đặt phòng");
      return;
    }

    setLoading(true);

    try {
      // Gửi giá base price (chưa áp dụng khuyến mãi) để backend tự tính
      const result = await DatPhongServices.confirmBooking(
        {
          ...bookingData,
          totalAmount: bookingData.totalAmount, // Gửi giá base price
          promotionId: selectedPromotion?.maKM || undefined,
        },
        selectedPaymentMethod
      );

      Alert.alert(
        "Thành công",
        `Đặt phòng thành công!\nMã đặt phòng: ${result.data.bookingId}\nTổng tiền: ${formatCurrency(result.data.finalAmount || 0)}`,
        [
          {
            text: "OK",
            onPress: () => router.push("/booking/success"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Đã có lỗi xảy ra khi đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#FFFFFF", marginTop: 15 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận và thanh toán</Text>
      </View>

      <ScrollView style={styles.scrollViewContent}>
        {/* Lựa chọn của bạn Section */}
        <View style={styles.choiceSection}>
          <Text style={styles.choiceTitle}>Lựa chọn của bạn</Text>

          <View style={styles.roomCard}>
            <Image
              source={{ 
                uri: getImageUrl(roomInfo?.anh) || "https://via.placeholder.com/100x100?text=Room"
              }}
              style={styles.roomImage}
              onError={(error) => {
                console.log("Image load error:", error.nativeEvent.error);
                console.log("Attempted URL:", getImageUrl(roomInfo?.anh));
              }}
              onLoad={() => console.log("Image loaded successfully")}
            />
            <View style={styles.roomInfo}>
              <Text style={styles.hotelName}>{hotelInfo?.tenKS}</Text>
              <Text style={styles.roomType}>{roomInfo?.tenPhong}</Text>
              <Text style={styles.address}>{hotelInfo?.diaChi}</Text>
              <Text style={styles.address}>{hotelInfo?.tinhThanh}</Text>
            </View>
          </View>

          {/* Duration and Check-in/out */}
          <View style={styles.timeSection}>
            <View style={styles.durationBox}>
              <View style={styles.heartIcons}>
                <Ionicons name="heart" size={12} color="#FFFFFF" />
                <Ionicons name="heart" size={12} color="#FFFFFF" />
              </View>
              <Ionicons name={getDurationIcon() as any} size={24} color="#FFFFFF" />
              <Text style={styles.durationText}>{getDurationText()}</Text>
            </View>

            <View style={styles.checkInOutBox}>
              <View style={styles.checkInOutRow}>
                <Text style={styles.checkInOutLabel}>Nhận phòng</Text>
                <Text style={styles.checkInOutValue}>
                  {formatDateTime(bookingData.checkInDateTime)}
                </Text>
              </View>
              <View style={styles.checkInOutRow}>
                <Text style={styles.checkInOutLabel}>Trả phòng</Text>
                <Text style={styles.checkInOutValue}>
                  {formatDateTime(bookingData.checkOutDateTime)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Người đặt phòng Section */}
        <View style={styles.bookerSection}>
          <View style={styles.bookerHeader}>
            <Text style={styles.bookerTitle}>Người đặt phòng</Text>
            <TouchableOpacity onPress={handleEditUserInfo}>
              <Text style={styles.editButton}>Sửa</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bookerInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>
                {userInfo?.sdt || "Chưa có thông tin"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Họ tên</Text>
              <Text style={styles.infoValue}>
                {userInfo?.hoTen || "Chưa có thông tin"}
              </Text>
            </View>
          </View>
        </View>

        {/* Ưu đãi Section */}
        <View style={styles.promoSection}>
          <TouchableOpacity
            style={styles.promoHeader}
            onPress={handleViewPromotions}
          >
            <Ionicons name="pricetag" size={20} color="#FB923C" />
            <Text style={styles.promoTitle}>Ưu đãi</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.promoDetail}>
            <View style={styles.promoItem}>
              <View style={styles.promoIconContainer}>
                <Text style={styles.promoIconText}>J</Text>
              </View>
              <Text style={styles.promoItemText}>
                {selectedPromotion ? getPromotionText() : "Joy Xu"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </View>
            <Text style={styles.promoRequirementText}>
              {selectedPromotion
                ? "Đã áp dụng khuyến mãi"
                : "Để dùng bạn cần tích luỹ ít nhất 50.000 Joy Xu"}
            </Text>
          </View>
        </View>

        {/* Chi tiết thanh toán Section */}
        <View style={styles.paymentDetailsSection}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>

          <View style={styles.paymentDetails}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tiền phòng</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(bookingData.totalAmount)}
              </Text>
            </View>
            {selectedPromotion && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Giảm giá</Text>
                <Text style={styles.infoValue}>
                  -{formatCurrency(bookingData.totalAmount - finalPrice)}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(finalPrice)}
              </Text>
            </View>
          </View>
        </View>

        {/* Chính sách hủy phòng Section */}
        <View style={styles.policySection}>
          <Text style={styles.sectionTitle}>Chính sách hủy phòng</Text>

          <Text style={styles.policyText}>
            Hủy miễn phí trước 06:00,{" "}
            {formatDateTime(bookingData.checkInDateTime)} khi thanh toán trả
            trước.
          </Text>

          <View style={styles.tipBox}>
            <Ionicons name="bulb" size={16} color="#FB923C" />
            <Text style={styles.tipText}>
              Gợi ý nhỏ: Hãy lựa chọn phương thức thanh toán để xem chi tiết
              chính sách nhé.
            </Text>
          </View>

          <Text style={styles.agreementText}>
            Tôi đồng ý với <Text style={styles.linkText}>Điều khoản</Text> và{" "}
            <Text style={styles.linkText}>Chính sách</Text> đặt phòng.
          </Text>

          <Text style={styles.supportText}>
            Dịch vụ hỗ trợ khách hàng -{" "}
            <Text style={styles.linkText}>Liên hệ ngay</Text>
          </Text>
        </View>

        {/* Chọn phương thức thanh toán */}
        <TouchableOpacity
          style={styles.paymentMethodSection}
          onPress={() => setShowPaymentModal(true)}
        >
          <Ionicons name="card" size={20} color="#FB923C" />
          <Text style={styles.paymentMethodTitle}>
            Chọn phương thức thanh toán
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Text style={styles.bottomTotalLabel}>Tổng thanh toán</Text>
          <Text style={styles.bottomTotalAmount}>
            {formatCurrency(finalPrice)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, loading && styles.bookButtonDisabled]}
          onPress={handleBookRoom}
          disabled={loading}
        >
          <Text style={styles.bookButtonText}>
            {loading ? "Đang xử lý..." : "Đặt phòng"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelect={handleSelectPaymentMethod}
        selectedMethod={selectedPaymentMethod}
      />

      {/* Edit User Info Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sửa thông tin</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Họ tên</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.hoTen}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({ ...prev, hoTen: text }))
                  }
                  placeholder="Nhập họ tên"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số điện thoại</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.sdt}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({ ...prev, sdt: text }))
                  }
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.email}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({ ...prev, email: text }))
                  }
                  placeholder="Nhập email"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveUserInfo}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? "Đang lưu..." : "Lưu"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Promotions Modal */}
      <Modal
        visible={showPromotionsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPromotionsModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          {/* Modal Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 40,
              paddingHorizontal: 16,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#F3F4F6",
            }}
          >
            <TouchableOpacity onPress={() => setShowPromotionsModal(false)}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
              Khuyến mãi
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Content */}
          <View style={{ flex: 1, padding: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#1F2937",
                }}
              >
                Ưu đãi sẵn có
              </Text>
              {selectedPromotion && (
                <TouchableOpacity
                  onPress={handleClearPromotion}
                  style={{
                    backgroundColor: "#F3F4F6",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      fontWeight: "600",
                    }}
                  >
                    Bỏ chọn
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {promotions.length > 0 ? (
                promotions.map((item) => (
                  <TouchableOpacity
                    key={item.maKM || `promo-${Math.random()}`}
                    onPress={() => handleSelectPromotion(item)}
                    style={{
                      backgroundColor:
                        selectedPromotion?.maKM === item.maKM
                          ? "#FEF3E7"
                          : "#FFFFFF",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 16,
                      borderWidth: 1,
                      borderColor:
                        selectedPromotion?.maKM === item.maKM
                          ? "#FB923C"
                          : "#F3F4F6",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <View style={{ flexDirection: "row" }}>
                      {/* Image */}
                      <View style={{ marginRight: 16 }}>
                        <Image
                          source={{
                            uri: (() => {
                              if (item.anh) {
                                if (
                                  Array.isArray(item.anh) &&
                                  item.anh.length > 0
                                ) {
                                  const imageUrl = getImageUrl(item.anh[0]);
                                  return imageUrl || undefined;
                                } else if (typeof item.anh === "string") {
                                  const imageUrl = getImageUrl(item.anh);
                                  return imageUrl || undefined;
                                }
                              }
                              return "../../assets/images/giamgia.jpg";
                            })(),
                          }}
                          style={{ width: 110, height: 110 }}
                          resizeMode="cover"
                        />
                      </View>

                      {/* Content */}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#1F2937",
                            marginBottom: 4,
                          }}
                        >
                          {item.tenKM}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#6B7280",
                            marginBottom: 8,
                          }}
                        >
                          {item.thongTinKM}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#FB923C",
                            fontWeight: "600",
                            marginBottom: 4,
                          }}
                        >
                          Tất cả loại đặt phòng
                        </Text>
                        <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                          Hạn sử dụng:{" "}
                          {item.ngayKetThuc
                            ? new Date(item.ngayKetThuc).toLocaleDateString(
                                "vi-VN"
                              )
                            : "12/10/2025"}
                        </Text>
                      </View>
                    </View>

                    {/* Select Button */}
                    <View style={{ marginTop: 12, alignItems: "flex-end" }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor:
                            selectedPromotion?.maKM === item.maKM
                              ? "#FB923C"
                              : "#F3F4F6",
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              selectedPromotion?.maKM === item.maKM
                                ? "#FFFFFF"
                                : "#6B7280",
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          {selectedPromotion?.maKM === item.maKM
                            ? "Đã chọn"
                            : "Chọn"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Text style={{ fontSize: 16, color: "#6B7280" }}>
                    Không có khuyến mãi nào
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = {
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1F2937",
    flex: 1,
    textAlign: "center" as const,
    marginRight: 34,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  // Choice Section
  choiceSection: {
    marginBottom: 20,
  },
  choiceTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  roomCard: {
    flexDirection: "row" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roomImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  roomInfo: {
    flex: 1,
    justifyContent: "center" as const,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  roomType: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FB923C",
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },

  // Time Section
  timeSection: {
    flexDirection: "row" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  durationBox: {
    width: 80,
    height: 80,
    backgroundColor: "#FB923C",
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 16,
    position: "relative" as const,
  },
  heartIcons: {
    position: "absolute" as const,
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  durationText: {
    fontSize: 14,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
    marginTop: 8,
  },
  checkInOutBox: {
    flex: 1,
    justifyContent: "center" as const,
  },
  checkInOutRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
  },
  checkInOutLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  checkInOutValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },

  // Booker Section
  bookerSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookerHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  bookerTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1F2937",
  },
  editButton: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FB923C",
  },
  bookerInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },

  // Promo Section
  promoSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  promoHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
  },
  promoDetail: {
    marginLeft: 28,
  },
  promoItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  promoIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 8,
  },
  promoIconText: {
    fontSize: 14,
    fontWeight: "bold" as const,
    color: "#4B5563",
  },
  promoItemText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    flex: 1,
  },
  promoRequirementText: {
    fontSize: 12,
    color: "#6B7280",
  },

  // Payment Details Section
  paymentDetailsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1F2937",
    marginBottom: 16,
  },
  paymentDetails: {
    gap: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#1F2937",
  },

  // Policy Section
  policySection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  policyText: {
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 12,
    lineHeight: 20,
  },
  tipBox: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#FEF3E7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 12,
    color: "#FB923C",
    marginLeft: 8,
    flex: 1,
  },
  agreementText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: "#6B7280",
  },
  linkText: {
    color: "#FB923C",
    textDecorationLine: "underline" as const,
  },

  // Payment Method Section
  paymentMethodSection: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  totalSection: {
    flex: 1,
  },
  bottomTotalLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  bottomTotalAmount: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#1F2937",
  },
  bookButton: {
    backgroundColor: "#FB923C",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  bookButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "90%" as const,
    maxHeight: "80%" as const,
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1F2937",
  },
  formContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  modalActions: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center" as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: "#FB923C",
    alignItems: "center" as const,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
};
