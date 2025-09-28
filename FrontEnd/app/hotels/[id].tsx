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
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  KhachSanServices,
  KhachSanData,
} from "../../services/KhachSanServices";
import { getImageUrl } from "../../utils/getImageUrl";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<KhachSanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      loadHotelDetail();
    }
  }, [id]);

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

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement add/remove favorite API
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    Alert.alert("Chia sẻ", "Tính năng chia sẻ sẽ được cập nhật sớm");
  };

  const handleSelectRoom = () => {
    router.push(`/rooms/${id}`);
  };

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
            paddingTop:
              Platform.OS === "ios"
                ? 50
                : StatusBar.currentHeight
                  ? StatusBar.currentHeight + 10
                  : 40,
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
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={{ marginTop: 16, color: "#6B7280" }}>Đang tải...</Text>
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
            paddingTop:
              Platform.OS === "ios"
                ? 50
                : StatusBar.currentHeight
                  ? StatusBar.currentHeight + 10
                  : 40,
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

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Hotel Images */}
        <View style={{ position: "relative" }}>
          <Image
            source={{
              uri: hotel.anh
                ? getImageUrl(hotel.anh)
                : "https://via.placeholder.com/400x300",
            }}
            style={{ width: SCREEN_WIDTH, height: 300 }}
            resizeMode="cover"
          />
          {/* Header Overlay */}
          <View
            style={{
              position: "absolute",
              top:
                Platform.OS === "ios"
                  ? 50
                  : StatusBar.currentHeight
                    ? StatusBar.currentHeight + 10
                    : 40,
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
          {/* Rating Badge */}
          <View
            style={{
              position: "absolute",
              top: 200,
              right: 16,
              backgroundColor: "#FB923C",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text
              style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold" }}
            >
              Nổi bật
            </Text>
          </View>
        </View>

        {/* Hotel Info */}
        <View style={{ padding: 16 }}>
          {/* Hotel Name and Rating */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 8,
              }}
            >
              {hotel.tenKS}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons name="star" size={16} color="#FCD34D" />
              <Text style={{ marginLeft: 4, fontSize: 16, color: "#6B7280" }}>
                5.0 (19)
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 14,
                  color: "#6B7280",
                  flex: 1,
                }}
              >
                {hotel.diaChi}, {hotel.tinhThanh}
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

          {/* Promotion */}
          <View
            style={{
              backgroundColor: "#FEF3E7",
              padding: 12,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="pricetag" size={20} color="#FB923C" />
            <Text
              style={{ marginLeft: 8, color: "#FB923C", fontWeight: "600" }}
            >
              Giảm 27K, đặt tối thiểu 150K
            </Text>
          </View>

          {/* Rating Section */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{ fontSize: 32, fontWeight: "bold", color: "#1F2937" }}
            >
              5.0
            </Text>
            <Text style={{ fontSize: 16, color: "#6B7280", marginBottom: 16 }}>
              Tuyệt vời
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280" }}>19 đánh giá</Text>

            {/* Review Preview */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
                paddingVertical: 12,
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: "#F3F4F6",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#6366F1",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <View style={{ flexDirection: "row", marginBottom: 4 }}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons key={i} name="star" size={12} color="#FCD34D" />
                  ))}
                </View>
                <Text
                  style={{ fontSize: 14, color: "#1F2937", fontWeight: "600" }}
                >
                  nam
                </Text>
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  Phòng của sở đơn năng tự nhiên
                </Text>
              </View>
            </View>
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

          {/* Description */}
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
              Từ nội thành đến ngoại thành, Keypad Hotel này đã có mặt tại 8 cơ
              sở rộng khắp các quận trung tâm của Hà Nội: Hoàn Kiếm, Ba Đình,
              Cầu Giấy, Tha...
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  color: "#FB923C",
                  fontSize: 14,
                  fontWeight: "600",
                  marginTop: 8,
                }}
              >
                Xem thêm
              </Text>
            </TouchableOpacity>
          </View>

          {/* Room Booking Info */}
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

          {/* Cancellation Policy */}
          <View style={{ marginBottom: 100 }}>
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
            <TouchableOpacity>
              <Text
                style={{ color: "#FB923C", fontSize: 14, fontWeight: "600" }}
              >
                Chi tiết phòng
              </Text>
            </TouchableOpacity>
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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        }}
      >
        <View>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#1F2937",
              }}
            >
              {hotel.giaThapNhat
                ? `${hotel.giaThapNhat.toLocaleString()}đ`
                : "498.000đ"}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            Chỉ từ
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSelectRoom}
          style={{
            backgroundColor: "#FB923C",
            borderRadius: 25,
            paddingHorizontal: 32,
            paddingVertical: 14,
            shadowColor: "#FB923C",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>
            Chọn phòng
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
