import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  DatPhongServices,
  DatPhongData,
  CompletedBookingData,
} from "../../services/DatPhongServices";
import { DanhGiaServices } from "../../services/DanhGiaServices";

export default function BookedScreen() {
  const [bookings, setBookings] = useState<DatPhongData[]>([]);
  const [completedBookings, setCompletedBookings] = useState<
    CompletedBookingData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [completedLoading, setCompletedLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<CompletedBookingData | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  // States cho việc sửa/xóa đánh giá
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [reviewToDelete, setReviewToDelete] =
    useState<CompletedBookingData | null>(null);

  useEffect(() => {
    loadBookings();
    loadCompletedBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await DatPhongServices.getAll();
      setBookings(data || []);
    } catch (error) {
      console.error("❌ Error loading bookings:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedBookings = async () => {
    try {
      setCompletedLoading(true);
      const data = await DatPhongServices.getCompletedBookings();

      // Kiểm tra trạng thái review cho từng booking
      const bookingsWithReviewStatus = await Promise.all(
        (data || []).map(async (booking) => {
          try {
            // Kiểm tra xem có review trong database không
            const review = await DanhGiaServices.getReviewByBookingId(booking.maDP);
            return {
              ...booking,
              hasReviewed: !!review,
              review: review ? {
                maDG: review.maDG,
                soSao: review.soSao,
                binhLuan: review.binhLuan,
                ngayDG: review.ngayDG,
              } : undefined,
            };
          } catch (error) {
            console.log("Error checking review status:", error);
            return booking;
          }
        })
      );

      setCompletedBookings(bookingsWithReviewStatus);
    } catch (error) {
      console.error("❌ Error loading completed bookings:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách đặt phòng hoàn thành");
    } finally {
      setCompletedLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadBookings(), loadCompletedBookings()]);
    setRefreshing(false);
  };

  const handleReview = (booking: CompletedBookingData) => {
    if (booking.hasReviewed && booking.review) {
      // Nếu đã có đánh giá, cho phép sửa
      setSelectedBooking(booking);
      setRating(booking.review.soSao);
      setReviewText(booking.review.binhLuan || "");
      setIsEditingReview(true);
      setReviewModalVisible(true);
    } else {
      // Tạo đánh giá mới
      setSelectedBooking(booking);
      setRating(5);
      setReviewText("");
      setIsEditingReview(false);
      setReviewModalVisible(true);
    }
  };

  const handleDeleteReview = (booking: CompletedBookingData) => {
    setReviewToDelete(booking);
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete || !reviewToDelete.review) return;

    setDeleteConfirmVisible(false);

    try {
      const response = await DanhGiaServices.deleteReview(
        reviewToDelete.review.maDG
      );

      if (response.success || response) {
        // Cập nhật local state ngay lập tức
        setCompletedBookings((prev) =>
          prev.map((booking) =>
            booking.maDP === reviewToDelete.maDP
              ? {
                  ...booking,
                  hasReviewed: false,
                  review: undefined,
                }
              : booking
          )
        );

        // Review status will be updated automatically when we reload the data

        Alert.alert("Thành công", "Đánh giá đã được xóa!");

        // Reload completed bookings để đảm bảo sync với backend (chạy ngầm)
        loadCompletedBookings();
      } else {
        Alert.alert("Lỗi", response.message || "Không thể xóa đánh giá");
      }
    } catch (error) {
      console.error("❌ Error deleting review:", error);
      Alert.alert("Lỗi", "Không thể xóa đánh giá");
    }

    setReviewToDelete(null);
  };

  const submitReview = async () => {
    if (!selectedBooking) return;

    // Đóng modal ngay lập tức để UX tốt hơn
    setReviewModalVisible(false);

    try {
      let response;

      if (isEditingReview && selectedBooking.review) {
        // Cập nhật đánh giá hiện có
        response = await DanhGiaServices.updateReview(
          selectedBooking.review.maDG,
          rating,
          reviewText
        );
      } else {
        // Tạo đánh giá mới
        response = await DatPhongServices.submitReview(
          selectedBooking.maDP,
          rating,
          reviewText
        );
      }

      if (response.success || response) {
        // Cập nhật local state ngay lập tức
        setCompletedBookings((prev) =>
          prev.map((booking) =>
            booking.maDP === selectedBooking.maDP
              ? {
                  ...booking,
                  hasReviewed: true,
                  review: {
                    maDG: selectedBooking.review?.maDG || response.maDG || "",
                    soSao: rating,
                    binhLuan: reviewText,
                    ngayDG: new Date().toISOString(),
                  },
                }
              : booking
          )
        );

        // Hiển thị thông báo thành công
        const message = isEditingReview
          ? "Đánh giá đã được cập nhật!"
          : "Đánh giá của bạn đã được gửi!";
        Alert.alert("Thành công", message);

        // Reload completed bookings để đảm bảo sync với backend (chạy ngầm)
        loadCompletedBookings();
      } else {
        Alert.alert("Lỗi", response.message || "Không thể gửi đánh giá");
      }
    } catch (error) {
      console.error("❌ Error submitting review:", error);
      Alert.alert("Lỗi", "Không thể gửi đánh giá");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (trangThai: string) => {
    switch (trangThai) {
      case "Chờ xác nhận thanh toán":
        return "Chờ thanh toán";
      case "Đã xác nhận":
        return "Đã xác nhận";
      case "Đã hủy":
        return "Đã hủy";
      case "Hoàn thành":
        return "Hoàn thành";
      case "Đang sử dụng":
        return "Đang sử dụng";
      default:
        return trangThai || "Chờ xác nhận";
    }
  };

  const getStatusColor = (trangThai: string) => {
    switch (trangThai) {
      case "Chờ xác nhận thanh toán":
        return "#F59E0B";
      case "Đã xác nhận":
        return "#10B981";
      case "Đã hủy":
        return "#EF4444";
      case "Hoàn thành":
        return "#6B7280";
      case "Đang sử dụng":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const renderBookingItem = ({ item }: { item: DatPhongData }) => (
    <View style={styles.card}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Text style={styles.date}>
            {formatDate(item.ngayNhan)} - {formatDate(item.ngayTra)}
          </Text>
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              {getStatusText(item.trangThai)}
            </Text>
          </View>
        </View>
        <Ionicons
          name="ellipsis-vertical"
          size={18}
          color="#9CA3AF"
          style={{ marginLeft: "auto" }}
        />
      </View>
      <Text style={styles.code}>Mã đặt phòng: {item.maDatPhong}</Text>
      <Text style={styles.hotel}>{item.KhachSan?.tenKS || "Khách sạn"}</Text>
      <Text style={styles.room} numberOfLines={1}>
        {item.loaiDat} | {item.Phong?.tenPhong || "Phòng"}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 4,
        }}
      >
        <Ionicons
          name="card-outline"
          size={18}
          color="#2563EB"
          style={{ marginRight: 4 }}
        />
        <Text style={styles.price}>
          {item.tongTienSauGiam?.toLocaleString("vi-VN") ||
            item.tongTienGoc?.toLocaleString("vi-VN")}
          ₫
        </Text>
        {item.KhuyenMai && (
          <Text style={styles.discountText}>
            (Đã giảm {item.KhuyenMai.thongTinKM})
          </Text>
        )}
      </View>
    </View>
  );

  const renderCompletedBookingItem = ({
    item,
  }: {
    item: CompletedBookingData;
  }) => (
    <View style={styles.card}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Text style={styles.date}>
            {formatDate(item.ngayNhan)} - {formatDate(item.ngayTra)}
          </Text>
          <View style={[styles.statusBox, { backgroundColor: "#D1FAE5" }]}>
            <Text style={[styles.statusText, { color: "#059669" }]}>
              Hoàn thành
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => handleReview(item)}
            style={{
              backgroundColor: item.hasReviewed ? "#10B981" : "#3B82F6",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              marginRight: item.hasReviewed ? 8 : 0,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {item.hasReviewed ? "Sửa" : "Đánh giá"}
            </Text>
          </TouchableOpacity>

          {item.hasReviewed && (
            <TouchableOpacity
              onPress={() => handleDeleteReview(item)}
              style={{
                backgroundColor: "#EF4444",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                Xóa
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.code}>Mã đặt phòng: {item.maDP}</Text>
      <Text style={styles.hotel}>{item.tenKS || "Khách sạn"}</Text>
      <Text style={styles.room} numberOfLines={1}>
        {item.loaiDat} | {item.tenPhong || "Phòng"}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 4,
        }}
      >
        <Ionicons
          name="card-outline"
          size={18}
          color="#2563EB"
          style={{ marginRight: 4 }}
        />
        <Text style={styles.price}>
          {item.tongTienSauGiam?.toLocaleString("vi-VN") ||
            item.tongTienGoc?.toLocaleString("vi-VN")}
          ₫
        </Text>
      </View>
      <Text style={[styles.date, { marginTop: 8 }]}>
        Hoàn thành: {formatDate(item.completedAt)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F5F6FA",
        }}
      >
        <ActivityIndicator size="large" color="#FB923C" />
        <Text style={{ marginTop: 16, color: "#6B7280" }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.activeTabText,
            ]}
          >
            Đang hoạt động
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completed" && styles.activeTabText,
            ]}
          >
            Đã hoàn thành
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "active" ? (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.maDatPhong}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 8, backgroundColor: "#F5F6FA" }} />
          )}
          ListEmptyComponent={() => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 100,
              }}
            >
              <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
              <Text style={{ marginTop: 16, color: "#6B7280", fontSize: 16 }}>
                Chưa có đặt phòng nào
              </Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={completedBookings}
          renderItem={renderCompletedBookingItem}
          keyExtractor={(item) => item.maDP}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 8, backgroundColor: "#F5F6FA" }} />
          )}
          ListEmptyComponent={() => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 100,
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={64}
                color="#9CA3AF"
              />
              <Text style={{ marginTop: 16, color: "#6B7280", fontSize: 16 }}>
                Chưa có đặt phòng hoàn thành nào
              </Text>
            </View>
          )}
        />
      )}

      {/* Loading Indicator */}
      {(loading || completedLoading) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditingReview ? "Sửa đánh giá" : "Đánh giá khách sạn"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedBooking?.tenKS} - {selectedBooking?.tenPhong}
            </Text>

            {/* Rating Stars */}
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Đánh giá:</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={32}
                      color={star <= rating ? "#FCD34D" : "#D1D5DB"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Review Text */}
            <TextInput
              style={styles.reviewInput}
              placeholder="Viết đánh giá của bạn..."
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setReviewModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitReview}
              >
                <Text style={styles.submitButtonText}>
                  {isEditingReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận xóa đánh giá</Text>
            <Text style={styles.modalSubtitle}>
              Bạn có chắc chắn muốn xóa đánh giá này không?
            </Text>
            <Text style={[styles.modalSubtitle, { marginTop: 8 }]}>
              {reviewToDelete?.tenKS} - {reviewToDelete?.tenPhong}
            </Text>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#EF4444" }]}
                onPress={confirmDeleteReview}
              >
                <Text style={styles.submitButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 0,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  date: {
    fontSize: 13,
    color: "#6B7280",
    marginRight: 4,
    fontWeight: "500",
  },
  time: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "bold",
    marginRight: 8,
    marginLeft: 2,
  },
  statusBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  statusText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 13,
  },
  code: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
    marginTop: 2,
  },
  hotel: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "bold",
    marginBottom: 2,
  },
  room: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  price: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "bold",
    marginLeft: 2,
  },
  discountText: {
    fontSize: 12,
    color: "#FB923C",
    fontWeight: "600",
    marginLeft: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 0) + 10,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#3B82F6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  ratingContainer: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
    marginBottom: 24,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
