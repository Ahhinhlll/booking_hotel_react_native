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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  DatPhongServices,
  DatPhongData,
} from "../../services/DatPhongServices";

export default function BookedScreen() {
  const [bookings, setBookings] = useState<DatPhongData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
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
    <View style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingBottom: 10,
        }}
      ></View>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.maDatPhong}
        contentContainerStyle={{ paddingBottom: 84 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text style={styles.date}>{formatDate(item.ngayDat)}</Text>
              <Text style={styles.time}>{formatTime(item.ngayDat)}</Text>
              <View
                style={[
                  styles.statusBox,
                  { backgroundColor: getStatusColor(item.trangThai) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.trangThai) },
                  ]}
                >
                  {getStatusText(item.trangThai)}
                </Text>
              </View>
              <Ionicons
                name="ellipsis-vertical"
                size={18}
                color="#9CA3AF"
                style={{ marginLeft: "auto" }}
              />
            </View>
            <Text style={styles.code}>Mã đặt phòng: {item.maDatPhong}</Text>
            <Text style={styles.hotel}>
              {item.KhachSan?.tenKS || "Khách sạn"}
            </Text>
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
        )}
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
            <Text style={{ marginTop: 8, color: "#9CA3AF", fontSize: 12 }}>
              Debug: bookings.length = {bookings.length}
            </Text>
            <Text style={{ marginTop: 4, color: "#9CA3AF", fontSize: 12 }}>
              loading = {loading.toString()}
            </Text>
          </View>
        )}
      />
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
});
