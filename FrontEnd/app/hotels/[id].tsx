import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  KhachSanServices,
  KhachSanData,
} from "../../services/KhachSanServices";
// Force TypeScript to reload types
import {
  KhuyenMaiServices,
  KhuyenMaiData,
} from "../../services/KhuyenMaiServices";
import { getImageUrl } from "../../utils/getImageUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import HotelSection from "../../components/HotelSection";
import CustomDateTimePicker from "../../components/DateTimePicker";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const parseImageUrls = (images: string[] | undefined): string[] => {
  if (!images || images.length === 0) {
    return [];
  }

  return images
    .map((img) => getImageUrl(img))
    .filter((url): url is string => !!url);
};

export default function HotelDetailScreen() {
  const { id, bookingData, returnToRooms } = useLocalSearchParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<KhachSanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [bookingType, setBookingType] = useState("Theo giờ");
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showPromotionsModal, setShowPromotionsModal] = useState(false);
  const [showHotelDetailsModal, setShowHotelDetailsModal] = useState(false);
  const [promotions, setPromotions] = useState<KhuyenMaiData[]>([]);
  const [selectedPromotion, setSelectedPromotion] =
    useState<KhuyenMaiData | null>(null);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    const now = new Date();
    const startTime = new Date(now);
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 hours

    return {
      duration: 2,
      startTime: startTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      endTime: endTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: now.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      bookingType: "hourly" as "hourly" | "overnight" | "daily",
    };
  });

  useEffect(() => {
    if (id) {
      loadHotelDetail();
      loadPromotions();
    }
  }, [id]);

  // Handle booking data from rooms screen
  useEffect(() => {
    if (bookingData && typeof bookingData === "string") {
      try {
        const parsed = JSON.parse(bookingData);
        setSelectedDateTime({
          duration: parsed.duration || 2,
          startTime: parsed.startTime || "18:00",
          endTime: parsed.endTime || "20:00",
          date: parsed.date || "04/10",
          bookingType: parsed.bookingType || "hourly",
        });
        setBookingType(
          parsed.bookingType === "hourly"
            ? "Theo giờ"
            : parsed.bookingType === "overnight"
              ? "Qua đêm"
              : "Theo ngày"
        );
      } catch (error) {
        console.error("Error parsing booking data:", error);
      }
    }
  }, [bookingData]);

  // ... (các hàm useEffect, loadHotelDetail, handleBack, handleFavorite, handleShare, handleSelectRoom giữ nguyên)
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const stored = await AsyncStorage.getItem("yeuThich");
        if (stored && hotel) {
          const favorites: KhachSanData[] = JSON.parse(stored);
          const isHotelFavorite = favorites.some(
            (item) => item.maKS === hotel.maKS
          );
          setIsFavorite(isHotelFavorite);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    if (hotel) {
      checkFavoriteStatus();
    }
  }, [hotel]);

  const loadHotelDetail = async () => {
    try {
      setLoading(true);
      const data = await KhachSanServices.getById(id as string);
      setHotel(data);
    } catch (error) {
      console.error("Error loading hotel detail:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin khách sạn");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };
  const handleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem("yeuThich");
      let favorites: KhachSanData[] = stored ? JSON.parse(stored) : [];

      if (isFavorite) {
        // Xóa
        const updatedFavorites = favorites.filter(
          (item) => item.maKS !== hotel?.maKS
        );
        await AsyncStorage.setItem(
          "yeuThich",
          JSON.stringify(updatedFavorites)
        );
        setIsFavorite(false);

        Toast.show({
          type: "info",
          text1: "Đã xóa khỏi yêu thích",
          visibilityTime: 1000,
        });
      } else {
        // Thêm
        if (hotel) {
          favorites = [...favorites, hotel];
          await AsyncStorage.setItem("yeuThich", JSON.stringify(favorites));
        }
        setIsFavorite(true);

        Toast.show({
          type: "success",
          text1: "Đã thêm vào yêu thích",
          visibilityTime: 1000,
        });
      }
    } catch (error) {
      console.error("Error saving favorite:", error);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    Alert.alert("Chia sẻ", "Tính năng chia sẻ sẽ được cập nhật sớm");
  };

  const handleSelectRoom = () => {
    // Prepare booking data to pass to rooms screen
    const bookingData = {
      startTime: selectedDateTime.startTime,
      endTime: selectedDateTime.endTime,
      date: selectedDateTime.date,
      duration: selectedDateTime.duration,
      bookingType: selectedDateTime.bookingType,
    };

    if (returnToRooms === "true") {
      // If coming back from rooms screen, go back to rooms with updated data
      router.back();
    } else {
      // First time going to rooms screen
      router.push({
        pathname: "/rooms/[id]",
        params: {
          id: id as string,
          bookingData: JSON.stringify(bookingData),
        },
      });
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

  const handleViewMap = () => {
    // Mở Google Maps với địa chỉ khách sạn
    const address = encodeURIComponent(`${hotel?.diaChi}, ${hotel?.tinhThanh}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;

    // Hoặc navigate đến trang map trong app
    router.push({
      pathname: "/other/map",
      params: {
        hotelName: hotel?.tenKS,
        address: `${hotel?.diaChi}, ${hotel?.tinhThanh}`,
        lat: "21.0285", // Tọa độ mẫu
        lng: "105.8542",
      },
    });
  };

  const handleViewPromotions = () => {
    setShowPromotionsModal(true);
  };

  // Removed handleSelectPromotion - chỉ hiển thị thông tin khuyến mãi

  const calculatePriceWithPromotion = (basePrice: number) => {
    if (!selectedPromotion) return basePrice;

    // Parse discount from thongTinKM (e.g., "giảm 40K" -> 40000)
    const discountMatch = selectedPromotion.thongTinKM?.match(/giảm\s*(\d+)k/i);
    if (discountMatch) {
      const discountAmount = parseInt(discountMatch[1]) * 1000; // Convert to VND
      return Math.max(0, basePrice - discountAmount);
    }

    return basePrice;
  };

  const getPromotionText = () => {
    if (!selectedPromotion) return null;
    return selectedPromotion.thongTinKM || "Đã áp dụng khuyến mãi";
  };

  const handleViewMoreDetails = () => {
    setShowHotelDetailsModal(true);
  };

  const handleTimeSelect = () => {
    setShowTimePickerModal(true);
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };
  // ... (mã loading/error screen giữ nguyên)

  // Helper function to get amenity icon
  const getAmenityIcon = (amenityName: string) => {
    const iconMap: { [key: string]: string } = {
      TV: "tv",
      Wifi: "wifi",
      "Điều hòa": "snow",
      "Bồn tắm": "water",
      "Sân vườn": "leaf",
      "Cà phê": "cafe",
      "Nước suối": "water",
      "Móc treo": "shirt",
      Netflix: "tv",
      "Miễn phí": "checkmark-circle",
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (amenityName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return "checkmark-circle";
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // Try to parse different date formats
        const isoDate = new Date(dateString.replace(/ /g, "T"));
        if (!isNaN(isoDate.getTime())) {
          return isoDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        }
        return new Date().toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }

      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return new Date().toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <View
          style={{
            paddingTop: 40,
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#FFFFFF",
            elevation: 2,
          }}
        >
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
            Chi tiết khách sạn
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View className="flex-1 bg-white items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="mt-4 text-gray-500">Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (!hotel) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <View
          style={{
            paddingTop: 40,
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#FFFFFF",
            elevation: 2,
          }}
        >
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
            Chi tiết khách sạn
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={{ marginTop: 16, color: "#EF4444", fontSize: 16 }}>
            Không tìm thấy khách sạn
          </Text>
        </View>
      </View>
    );
  }

  const imageUrls = parseImageUrls(hotel.anh);
  const displayImageUrls = imageUrls;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Hotel Images Grid */}
        <View style={{ position: "relative" }}>
          <View style={{ height: 300, padding: 2 }}>
            {/* Top row - 2 large images */}
            <View
              style={{ height: 150, flexDirection: "row", marginBottom: 2 }}
            >
              {[0, 1].map((i) => (
                <TouchableOpacity
                  key={i}
                  style={{
                    flex: 1,
                    marginHorizontal: i === 0 ? 0 : 1,
                    marginRight: i === 0 ? 1 : 0,
                  }}
                  onPress={() => setShowGalleryModal(true)}
                >
                  <Image
                    source={{ uri: displayImageUrls[i] || displayImageUrls[0] }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Bottom row - 3 small images */}
            <View style={{ height: 146, flexDirection: "row" }}>
              {[2, 3, 4].map((i, idx) => (
                <TouchableOpacity
                  key={i}
                  style={{
                    flex: 1,
                    marginRight: idx === 0 ? 1 : 0,
                    marginLeft: idx === 2 ? 1 : 0,
                    marginHorizontal: idx === 1 ? 1 : 0,
                    position: idx === 2 ? "relative" : "relative",
                  }}
                  onPress={() => setShowGalleryModal(true)}
                >
                  <Image
                    source={{ uri: displayImageUrls[i] || displayImageUrls[0] }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                  {/* Overlay with count */}
                  {idx === 2 && displayImageUrls.length > 5 && (
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 18,
                          fontWeight: "bold",
                        }}
                      >
                        +{displayImageUrls.length - 4}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Header Overlay - GIỮ NGUYÊN */}
          <View
            style={{
              position: "absolute",
              top: 35,
              left: 0,
              right: 0,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <TouchableOpacity
              onPress={handleBack}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.9)",
                justifyContent: "center",
                alignItems: "center",
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={handleFavorite}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.9)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorite ? "#EF4444" : "#333"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.9)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="share-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Hotel Info - GIỮ NGUYÊN */}
        <View style={{ padding: 16 }}>
          {/* Hotel Rating and Featured Badge */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 5,
              }}
            >
              <Ionicons name="star" size={16} color="#FCD34D" />
              <Text
                style={{
                  color: "#1F2937",
                  fontSize: 16,
                  fontWeight: "600",
                  marginLeft: 4,
                }}
              >
                {hotel.hangSao || 5}.0{" "}
                <Text style={{ color: "#9CA3AF" }}>
                  ({hotel.diemDanhGia || 0})
                </Text>
              </Text>
            </View>
            {hotel.noiBat === "Nổi bật" && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 5,
                  marginLeft: 8,
                }}
              >
                <Ionicons name="flame" size={14} color="#EF4444" />
                <Text
                  style={{
                    color: "#EF4444",
                    fontSize: 12,
                    fontWeight: "600",
                    marginLeft: 4,
                  }}
                >
                  {hotel.noiBat}
                </Text>
              </View>
            )}
          </View>

          {/* Hotel Name */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#1F2937",
              marginBottom: 12,
              lineHeight: 30,
            }}
          >
            {hotel.tenKS}
          </Text>

          {/* Address and Distance */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                lineHeight: 20,
                marginBottom: 8,
              }}
            >
              {hotel.diaChi}, {hotel.tinhThanh}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                Cách bạn 8.9km
              </Text>
              <TouchableOpacity onPress={handleViewMap}>
                <Text
                  style={{ color: "#FB923C", fontSize: 14, fontWeight: "600" }}
                >
                  Xem bản đồ
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Promotion Banner */}
          {(hotel as any).KhuyenMais &&
            (hotel as any).KhuyenMais.length > 0 && (
              <TouchableOpacity
                onPress={handleViewPromotions}
                style={{
                  backgroundColor: "#FEF3E7",
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: "#FB923C",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Ionicons name="pricetag" size={20} color="#FB923C" />
                  <Text
                    style={{
                      marginLeft: 8,
                      color: "#FB923C",
                      fontWeight: "600",
                      fontSize: 14,
                      flex: 1,
                    }}
                  >
                    {selectedPromotion ? getPromotionText() : "Ưu đãi có sẵn"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FB923C" />
              </TouchableOpacity>
            )}

          {/* Rating Section */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              {/* Cột trái: điểm */}
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "bold",
                  color: "#1F2937",
                  lineHeight: 40,
                }}
              >
                {hotel.hangSao}.0
              </Text>

              {/* Cột phải: mô tả và số đánh giá */}
              <View style={{ marginLeft: 8 }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#1F2937",
                    fontWeight: "600",
                    marginBottom: 2,
                  }}
                >
                  {hotel.hangSao === 1
                    ? "Tệ"
                    : hotel.hangSao === 2
                      ? "Không hài lòng"
                      : hotel.hangSao === 3
                        ? "Bình thường"
                        : hotel.hangSao === 4
                          ? "Hài lòng"
                          : "Tuyệt vời"}
                </Text>

                <Text style={{ fontSize: 13, color: "#6B7280" }}>
                  {hotel.diemDanhGia || 0} đánh giá
                </Text>
              </View>
            </View>

            {/* Review Preview */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", paddingRight: 16 }}>
                {((hotel as any).DanhGia?.slice(0, 3) || []).map(
                  (review: any, index: number) => (
                    <View
                      key={review.maDG || index}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        padding: 16,
                        marginRight: 12,
                        width: 280,
                        borderWidth: 1,
                        borderColor: "#F3F4F6",
                      }}
                    >
                      {/* User Info */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: "#6366F1",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 8,
                          }}
                        >
                          <Ionicons name="person" size={16} color="#FFFFFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              color: "#1F2937",
                              fontWeight: "600",
                            }}
                          >
                            {review.NguoiDung?.hoTen || "Khách hàng"}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#6B7280",
                            }}
                          >
                            {review.DatPhong?.Phong?.tenPhong ||
                              "Phòng tiêu chuẩn"}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                          }}
                        >
                          {[...Array(review.soSao || 5)].map((_, i) => (
                            <Ionicons
                              key={`star-${review.maDG || index}-${i}`}
                              name="star"
                              size={12}
                              color="#FCD34D"
                            />
                          ))}
                        </View>
                      </View>

                      {/* Review Content */}
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#1F2937",
                          lineHeight: 20,
                          marginBottom: 8,
                        }}
                      >
                        {review.binhLuan ||
                          "Người dùng chưa chia sẻ cảm nhận về khách sạn."}
                      </Text>

                      {/* Date */}
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#9CA3AF",
                        }}
                      >
                        {review.ngayDG
                          ? formatDate(review.ngayDG)
                          : "Đánh giá mới"}
                      </Text>
                    </View>
                  )
                )}

                {/* View All Button */}
                <TouchableOpacity
                  onPress={() => setShowReviewsModal(true)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 16,
                    marginRight: 12,
                    width: 100,
                    borderWidth: 1,
                    borderColor: "#F3F4F6",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FB923C",
                      fontSize: 14,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Xem tất cả
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* Amenities */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1F2937",
                  flex: 1,
                }}
              >
                Tiện ích khách sạn
              </Text>
              <TouchableOpacity onPress={() => setShowAmenitiesModal(true)}>
                <Text
                  style={{ color: "#FB923C", fontSize: 14, fontWeight: "600" }}
                >
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {((hotel as any).TienNghis?.slice(0, 4) || []).map(
                (amenity: any, index: number) => (
                  <View
                    key={amenity.maTienNghi || index}
                    style={{
                      width: "50%",
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "#F3F4F6",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 8,
                      }}
                    >
                      <Ionicons
                        name={getAmenityIcon(amenity.tenTienNghi) as any}
                        size={16}
                        color="#10B981"
                      />
                    </View>
                    <Text style={{ fontSize: 14, color: "#6B7280", flex: 1 }}>
                      {amenity.tenTienNghi}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>

          {/* Giới thiệu */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 12,
              }}
            >
              Giới thiệu
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280", lineHeight: 20 }}>
              {hotel.tenKS} hiện có 8 chi nhánh trải rộng khắp các quận trung
              tâm Hà Nội: Hoàn Kiếm, Ba Đình, Cầu Giấy, Thanh Xuân...
              <TouchableOpacity onPress={handleViewMoreDetails}>
                <Text style={{ color: "#FB923C", fontWeight: "600" }}>
                  Xem thêm
                </Text>
              </TouchableOpacity>
            </Text>
          </View>

          {/* Giờ nhận phòng/trả phòng */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 12,
              }}
            >
              Giờ nhận phòng/trả phòng
            </Text>

            <View style={{ marginBottom: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 14, color: "#6B7280" }}>
                  Loại đặt phòng
                </Text>
                <Text style={{ fontSize: 14, color: "#6B7280" }}>
                  Thời gian
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 14, color: "#1F2937" }}>Theo giờ</Text>
                <Text style={{ fontSize: 14, color: "#1F2937" }}>
                  Từ 08:00 đến 22:00
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 14, color: "#1F2937" }}>Qua đêm</Text>
                <Text style={{ fontSize: 14, color: "#1F2937" }}>
                  Từ 22:00 đến 09:00
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 14, color: "#1F2937" }}>
                  Theo ngày
                </Text>
                <Text style={{ fontSize: 14, color: "#1F2937" }}>
                  Từ 14:00 đến 12:00
                </Text>
              </View>
            </View>
          </View>

          {/* Chính sách hủy phòng */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 12,
              }}
            >
              Chính sách hủy phòng
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280", lineHeight: 20 }}>
              Việc hủy phòng sẽ tuân theo quy định riêng của từng loại phòng và
              thời điểm đặt.
            </Text>
          </View>

          {/* Gợi ý cho bạn */}
          <View style={{ marginBottom: 24 }}>
            <HotelSection
              title="Gợi ý cho bạn"
              subtitle="Được đề xuất cho bạn"
              limit={3}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Booking Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderColor: "#F3F4F6",
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        }}
      >
        {/* Booking Time Section */}
        <TouchableOpacity
          onPress={() => setShowDateTimePicker(true)}
          style={{
            backgroundColor: "#FEF3E7",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="hourglass-outline" size={16} color="#FB923C" />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                color: "#FB923C",
                fontWeight: "600",
              }}
            >
              {selectedDateTime.duration} giờ | {selectedDateTime.startTime} →{" "}
              {selectedDateTime.endTime}, {selectedDateTime.date}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Price and Button Section */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
              Giá chỉ từ
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#1F2937",
              }}
            >
              {(() => {
                const basePrice = hotel.giaThapNhat || 800000;
                if (selectedPromotion) {
                  const finalPrice = calculatePriceWithPromotion(basePrice);
                  return finalPrice.toLocaleString("vi-VN") + "₫";
                }
                return basePrice.toLocaleString("vi-VN") + "₫";
              })()}
            </Text>
            {selectedPromotion && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#FB923C",
                  fontWeight: "600",
                  marginTop: 2,
                }}
              >
                {getPromotionText()}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSelectRoom}
            style={{
              backgroundColor: "#FB923C",
              borderRadius: 25,
              paddingHorizontal: 20,
              paddingVertical: 12,
              shadowColor: "#FB923C",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}
          >
            <Text
              style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}
            >
              Chọn phòng
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Gallery Modal */}
      <Modal
        visible={showGalleryModal}
        animationType="slide"
        presentationStyle="pageSheet"
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
            <TouchableOpacity onPress={() => setShowGalleryModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
              Khám phá
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* modal list ảnh khám phá */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ padding: 16 }}>
              {displayImageUrls.map((url, index) => (
                <View key={`gallery-${index}`} style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#1F2937",
                      marginBottom: 12,
                    }}
                  >
                    Hình ảnh {index + 1}
                  </Text>
                  <Image
                    source={{ uri: url }}
                    style={{
                      width: "100%",
                      height: 200,
                    }}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Reviews Modal */}
      <Modal
        visible={showReviewsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReviewsModal(false)}
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
            <TouchableOpacity onPress={() => setShowReviewsModal(false)}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
              Đánh giá & Nhận xét
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Overall Rating Card */}
          <View
            style={{
              backgroundColor: "#F9FAFB",
              margin: 16,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 32, fontWeight: "bold", color: "#1F2937" }}
                >
                  {hotel.hangSao}.0
                </Text>
                <Text
                  style={{ fontSize: 16, color: "#1F2937", fontWeight: "600" }}
                >
                  {hotel.hangSao === 1
                    ? "Tệ"
                    : hotel.hangSao === 2
                      ? "Không hài lòng"
                      : hotel.hangSao === 3
                        ? "Bình thường"
                        : hotel.hangSao === 4
                          ? "Hài lòng"
                          : "Tuyệt vời"}
                </Text>
                <Text style={{ fontSize: 14, color: "#6B7280" }}>
                  {hotel.diemDanhGia || 0} đánh giá
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name="hand-left" size={16} color="#6B7280" />
                  <Text
                    style={{ fontSize: 14, color: "#6B7280", marginLeft: 8 }}
                  >
                    Sạch sẽ
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: 4,
                      backgroundColor: "#E5E7EB",
                      borderRadius: 2,
                      marginLeft: 8,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: 4,
                        backgroundColor: "#FB923C",
                        borderRadius: 2,
                      }}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 14, color: "#6B7280", marginLeft: 8 }}
                  >
                    5.0
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name="happy" size={16} color="#6B7280" />
                  <Text
                    style={{ fontSize: 14, color: "#6B7280", marginLeft: 8 }}
                  >
                    Tiện ích
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: 4,
                      backgroundColor: "#E5E7EB",
                      borderRadius: 2,
                      marginLeft: 8,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: 4,
                        backgroundColor: "#FB923C",
                        borderRadius: 2,
                      }}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 14, color: "#6B7280", marginLeft: 8 }}
                  >
                    5.0
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="heart" size={16} color="#6B7280" />
                  <Text
                    style={{ fontSize: 14, color: "#6B7280", marginLeft: 8 }}
                  >
                    Dịch vụ
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: 4,
                      backgroundColor: "#E5E7EB",
                      borderRadius: 2,
                      marginLeft: 8,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: 4,
                        backgroundColor: "#FB923C",
                        borderRadius: 2,
                      }}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 14, color: "#6B7280", marginLeft: 8 }}
                  >
                    5.0
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Filter Options */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              marginBottom: 16,
            }}
          >
            {["Điểm", "Loại phòng", "Viết bởi"].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={{
                  backgroundColor: "#F3F4F6",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 14, color: "#6B7280", marginRight: 4 }}
                >
                  {filter}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Reviews List */}
          <FlatList
            data={(hotel as any).DanhGia || []}
            keyExtractor={(item: any) => item.maDG || item.id?.toString()}
            renderItem={({ item }: { item: any }) => (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F3F4F6",
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "flex-start" }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#6366F1",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="person" size={20} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#1F2937",
                          fontWeight: "600",
                          marginRight: 8,
                        }}
                      >
                        {item.NguoiDung?.hoTen || "Khách hàng"}
                      </Text>
                      <View style={{ flexDirection: "row" }}>
                        {[...Array(item.soSao || 5)].map((_, i) => (
                          <Ionicons
                            key={`star-modal-${item.maDG || "fallback"}-${i}`}
                            name="star"
                            size={14}
                            color="#FCD34D"
                          />
                        ))}
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#6B7280",
                        marginBottom: 8,
                      }}
                    >
                      {item.DatPhong?.Phong?.tenPhong || "Phòng tiêu chuẩn"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#1F2937",
                        lineHeight: 20,
                        marginBottom: 8,
                      }}
                    >
                      {item.binhLuan ||
                        "Người dùng chưa chia sẻ cảm nhận về khách sạn."}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                        {item.ngayDG ? formatDate(item.ngayDG) : "Đánh giá mới"}
                      </Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons name="thumbs-up" size={16} color="#9CA3AF" />
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#9CA3AF",
                            marginLeft: 4,
                          }}
                        >
                          Thích
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Amenities Modal */}
      <Modal
        visible={showAmenitiesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAmenitiesModal(false)}
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
            <TouchableOpacity onPress={() => setShowAmenitiesModal(false)}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
              Tiện ích khách sạn
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Amenities Grid */}
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {((hotel as any).TienNghis || []).map(
                (amenity: any, index: number) => (
                  <View
                    key={amenity.maTienNghi || index}
                    style={{
                      width: "33.33%",
                      alignItems: "center",
                      marginBottom: 24,
                    }}
                  >
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: "#F3F4F6",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Ionicons
                        name={getAmenityIcon(amenity.tenTienNghi) as any}
                        size={24}
                        color="#6B7280"
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#1F2937",
                        textAlign: "center",
                        paddingHorizontal: 8,
                      }}
                    >
                      {amenity.tenTienNghi}
                    </Text>
                  </View>
                )
              )}
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
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              Ưu đãi sẵn có
            </Text>

            <FlatList
              data={promotions.length > 0 ? promotions : []}
              keyExtractor={(item) => item.maKM || `promo-${Math.random()}`}
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "#F3F4F6",
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
                          ? formatDate(item.ngayKetThuc)
                          : "12/10/2025"}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Hotel Details Modal */}
      <Modal
        visible={showHotelDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHotelDetailsModal(false)}
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
            <TouchableOpacity onPress={() => setShowHotelDetailsModal(false)}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
              Thông tin chi tiết
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Content */}
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              {hotel?.tenKS}
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1F2937",
                marginBottom: 8,
              }}
            >
              Giới thiệu chi tiết
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                lineHeight: 22,
                marginBottom: 20,
              }}
            >
              {hotel?.tenKS} là một trong những chuỗi khách sạn hàng đầu tại
              Việt Nam với hệ thống 8 chi nhánh trải rộng khắp các quận trung
              tâm Hà Nội. Chúng tôi cam kết mang đến cho khách hàng những trải
              nghiệm nghỉ dưỡng tuyệt vời với dịch vụ chuyên nghiệp và tiện nghi
              hiện đại.
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1F2937",
                marginBottom: 8,
              }}
            >
              Vị trí chi nhánh
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                lineHeight: 22,
                marginBottom: 20,
              }}
            >
              • Hoàn Kiếm: 15 Nguyễn Du, Hoàn Kiếm, Hà Nội{"\n"}• Ba Đình: 8 Lê
              Hồng Phong, Ba Đình, Hà Nội{"\n"}• Cầu Giấy: 25 Trần Duy Hưng, Cầu
              Giấy, Hà Nội{"\n"}• Thanh Xuân: 12 Nguyễn Trãi, Thanh Xuân, Hà Nội
              {"\n"}• Đống Đa: 8 Tôn Đức Thắng, Đống Đa, Hà Nội{"\n"}• Hai Bà
              Trưng: 20 Bạch Mai, Hai Bà Trưng, Hà Nội{"\n"}• Tây Hồ: 5 Xuân
              Diệu, Tây Hồ, Hà Nội{"\n"}• Long Biên: 10 Nguyễn Văn Cừ, Long
              Biên, Hà Nội
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1F2937",
                marginBottom: 8,
              }}
            >
              Dịch vụ nổi bật
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                lineHeight: 22,
                marginBottom: 20,
              }}
            >
              • Phòng nghỉ hiện đại với đầy đủ tiện nghi{"\n"}• Dịch vụ spa và
              massage chuyên nghiệp{"\n"}• Nhà hàng phục vụ ẩm thực đa dạng
              {"\n"}• Hội trường tổ chức sự kiện{"\n"}• Dịch vụ đặt phòng 24/7
              {"\n"}• Wi-Fi miễn phí tốc độ cao{"\n"}• Bãi đỗ xe an toàn{"\n"}•
              Dịch vụ đưa đón sân bay
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1F2937",
                marginBottom: 8,
              }}
            >
              Liên hệ
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280", lineHeight: 22 }}>
              Hotline: {hotel?.dienThoai || "1900 1234"}
              {"\n"}
              Email: info@{hotel?.tenKS?.toLowerCase().replace(/\s+/g, "")}.com
              {"\n"}
              Website: www.{hotel?.tenKS?.toLowerCase().replace(/\s+/g, "")}.com
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* DateTime Picker Modal */}
      <CustomDateTimePicker
        visible={showDateTimePicker}
        onClose={() => setShowDateTimePicker(false)}
        onConfirm={(data) => {
          // Calculate checkout date and time based on booking type
          const calculateCheckoutDateTime = (
            checkInDate: Date,
            checkInTime: Date,
            bookingType: string,
            duration: number
          ) => {
            const checkoutDate = new Date(checkInDate);
            const checkoutTime = new Date(checkInTime);

            switch (bookingType) {
              case "hourly":
                // Add duration hours to checkout time
                checkoutTime.setHours(checkoutTime.getHours() + duration);
                // If checkout time goes to next day, update checkout date
                if (checkoutTime.getHours() >= 24) {
                  checkoutDate.setDate(checkoutDate.getDate() + 1);
                  checkoutTime.setHours(checkoutTime.getHours() - 24);
                }
                break;
              case "overnight":
                // Add 1 day and set checkout time to 9:00 AM
                checkoutDate.setDate(checkoutDate.getDate() + 1);
                checkoutTime.setHours(9, 0, 0, 0);
                break;
              case "daily":
                // Add 1 day and set checkout time to 12:00 PM
                checkoutDate.setDate(checkoutDate.getDate() + 1);
                checkoutTime.setHours(12, 0, 0, 0);
                break;
            }

            return { checkoutDate, checkoutTime };
          };

          const { checkoutDate, checkoutTime } = calculateCheckoutDateTime(
            data.checkInDate,
            data.checkInTime,
            data.bookingType,
            data.duration
          );

          setSelectedDateTime({
            duration: data.duration,
            startTime: data.checkInTime.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            endTime: checkoutTime.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: data.checkInDate.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            }),
            bookingType: data.bookingType,
          });
          setBookingType(
            data.bookingType === "hourly"
              ? "Theo giờ"
              : data.bookingType === "overnight"
                ? "Qua đêm"
                : "Theo ngày"
          );
        }}
        initialData={{
          checkInDate: new Date(),
          checkOutDate: new Date(),
          checkInTime: new Date(),
          checkOutTime: new Date(),
          bookingType: selectedDateTime.bookingType,
          duration: selectedDateTime.duration,
        }}
      />
    </View>
  );
}
