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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  KhachSanServices,
  KhachSanData,
} from "../../services/KhachSanServices";
import { getImageUrl } from "../../utils/getImageUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Cập nhật hàm xử lý ảnh: Giả định hotel.anh là string[]
const parseImageUrls = (images: string[] | undefined): string[] => {
  if (!images || images.length === 0) {
    return [];
  }

  return (
    images
      .map((img) => getImageUrl(img))
      // SỬA LỖI: Lọc các giá trị undefined để đảm bảo kiểu trả về là string[]
      .filter((url): url is string => !!url)
  );
};

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<KhachSanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  // State cho thời gian đặt phòng
  const [bookingTime, setBookingTime] = useState({
    duration: "02 giờ",
    startTime: "16:00",
    endTime: "18:00",
    date: "30/09",
  });
  // State cho modal chọn thời gian
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadHotelDetail();
    }
  }, [id]);

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
    router.push(`/rooms/${id}`);
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

  const amenities = [
    { icon: "tv", label: "TV with netflix" },
    { icon: "shirt", label: "Móc treo quần áo" },
    { icon: "cafe", label: "Cà phê/Trà miễn phí" },
    { icon: "water", label: "Nước suối miễn phí" },
  ];

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

  // TÍNH TOÁN URL ẢNH
  // const imageUrls = parseImageUrls(hotel.anh);
  // const displayImageUrls =
  //   imageUrls.length > 0 ? imageUrls : ["https://via.placeholder.com/400x300"];
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
                {hotel.hangSao}.0{" "}
                <Text style={{ color: "#9CA3AF" }}>({hotel.diemDanhGia})</Text>
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
              <TouchableOpacity>
                <Text
                  style={{ color: "#FB923C", fontSize: 14, fontWeight: "600" }}
                >
                  Xem bản đồ
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Promotion Banner */}
          <TouchableOpacity
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
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
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
                Giảm 27K, đặt tối thiểu 150K
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FB923C" />
          </TouchableOpacity>

          {/* Rating Section */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "bold",
                  color: "#1F2937",
                  lineHeight: 48,
                }}
              >
                5.0
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#1F2937",
                  fontWeight: "600",
                  marginLeft: 8,
                  marginBottom: 4,
                }}
              >
                Tuyệt vời
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 16 }}>
              19 đánh giá
            </Text>

            {/* Review Preview */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                paddingVertical: 16,
                borderTopWidth: 1,
                borderColor: "#F3F4F6",
              }}
            >
              {/* Star Rating */}
              <View style={{ marginRight: 16 }}>
                <View style={{ flexDirection: "row", marginBottom: 4 }}>
                  {[...Array(3)].map((_, i) => (
                    <Ionicons key={i} name="star" size={16} color="#FCD34D" />
                  ))}
                </View>
              </View>

              {/* User Avatar */}
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

              {/* Review Content */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#1F2937",
                    fontWeight: "600",
                    marginBottom: 2,
                  }}
                >
                  tieulang
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginBottom: 8,
                  }}
                >
                  Phòng ban công có bồn tắm
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#1F2937",
                    lineHeight: 20,
                  }}
                >
                  Phòng sạch sẽ, thơm tho, Giá cả phù hợp, Nhân viên thân thiện
                </Text>
              </View>

              {/* Rating Stars */}
              <View style={{ flexDirection: "row" }}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star" size={14} color="#FCD34D" />
                ))}
              </View>
            </View>
          </View>

          {/* Amenities - GIỮ NGUYÊN */}
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
              <TouchableOpacity>
                <Text
                  style={{ color: "#FB923C", fontSize: 14, fontWeight: "600" }}
                >
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {amenities.map((amenity, index) => (
                <View
                  key={index}
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
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                  </View>
                  <Text style={{ fontSize: 14, color: "#6B7280", flex: 1 }}>
                    {amenity.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* XÓA PHẦN MÔ TẢ (Giới thiệu) vì không có trường dữ liệu */}
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
              Thông tin giới thiệu về khách sạn đang được cập nhật từ hệ thống.
            </Text>
          </View>

          {/* Room Booking Info - GIỮ NGUYÊN */}
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
        </View>
      </ScrollView>

      {/* Bottom Booking Bar - Cập nhật lại layout để thời gian trên hàng riêng */}
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
        {/* Booking Time Section - Hiển thị trên hàng riêng */}
        <TouchableOpacity
          onPress={handleTimeSelect}
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
            <Ionicons name="time" size={16} color="#FB923C" />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                color: "#1F2937",
                fontWeight: "600",
              }}
            >
              {bookingTime.duration} | {bookingTime.startTime} →{" "}
              {bookingTime.endTime}, {bookingTime.date}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Price and Button Section - Hàng riêng */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
              Chỉ từ{" "}
              <Text style={{ textDecorationLine: "line-through" }}>
                350.000đ
              </Text>
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#1F2937",
              }}
            >
              250.000đ
            </Text>
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
                <View key={index} style={{ marginBottom: 24 }}>
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

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePickerModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTimePickerModal(false)}
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
            <TouchableOpacity onPress={() => setShowTimePickerModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
              Chọn thời gian
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Modal Content */}
          <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 16 }}>
              Chọn ngày và giờ nhận phòng
            </Text>

            {/* Date Picker */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
                Chọn ngày
              </Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  borderRadius: 8,
                  padding: 16,
                  backgroundColor: "#F9FAFB",
                }}
              >
                <Text style={{ fontSize: 16, color: "#1F2937" }}>
                  {bookingTime.date} - Tháng Chín, 2025
                </Text>
              </TouchableOpacity>
            </View>

            {/* Time Picker */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
                Chọn giờ nhận phòng
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                {[
                  "08:00",
                  "10:00",
                  "12:00",
                  "14:00",
                  "16:00",
                  "18:00",
                  "20:00",
                  "22:00",
                ].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={{
                      borderWidth: 1,
                      borderColor:
                        bookingTime.startTime === time ? "#FB923C" : "#D1D5DB",
                      backgroundColor:
                        bookingTime.startTime === time ? "#FEF3E7" : "#F9FAFB",
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      marginBottom: 8,
                      minWidth: 70,
                      alignItems: "center",
                    }}
                    onPress={() => {
                      // Cập nhật giờ bắt đầu và giờ kết thúc (giả định thời lượng là 2 giờ)
                      const [hours, minutes] = time.split(":");
                      const endTimeHours = (parseInt(hours) + 2) % 24;
                      const endTime = `${endTimeHours.toString().padStart(2, "0")}:${minutes}`;
                      setBookingTime({
                        ...bookingTime,
                        startTime: time,
                        endTime: endTime,
                      });
                    }}
                  >
                    <Text
                      style={{
                        color:
                          bookingTime.startTime === time
                            ? "#FB923C"
                            : "#6B7280",
                        fontWeight:
                          bookingTime.startTime === time ? "600" : "400",
                      }}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Duration Picker */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
                Chọn thời lượng
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {["02 giờ", "04 giờ", "06 giờ", "08 giờ"].map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={{
                      borderWidth: 1,
                      borderColor:
                        bookingTime.duration === duration
                          ? "#FB923C"
                          : "#D1D5DB",
                      backgroundColor:
                        bookingTime.duration === duration
                          ? "#FEF3E7"
                          : "#F9FAFB",
                      borderRadius: 8,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      flex: 1,
                      marginHorizontal: 4,
                      alignItems: "center",
                    }}
                    onPress={() => {
                      // Cập nhật thời lượng và giờ kết thúc tương ứng
                      const [startHours, startMinutes] =
                        bookingTime.startTime.split(":");
                      const durationHours = parseInt(
                        duration.replace(" giờ", "")
                      );
                      const endHours =
                        (parseInt(startHours) + durationHours) % 24;
                      const endTime = `${endHours.toString().padStart(2, "0")}:${startMinutes}`;

                      setBookingTime({
                        ...bookingTime,
                        duration: duration,
                        endTime: endTime,
                      });
                    }}
                  >
                    <Text
                      style={{
                        color:
                          bookingTime.duration === duration
                            ? "#FB923C"
                            : "#6B7280",
                        fontWeight:
                          bookingTime.duration === duration ? "600" : "400",
                      }}
                    >
                      {duration}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              onPress={() => setShowTimePickerModal(false)}
              style={{
                backgroundColor: "#FB923C",
                borderRadius: 25,
                paddingVertical: 16,
                alignItems: "center",
                marginTop: "auto",
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}
              >
                Áp dụng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
