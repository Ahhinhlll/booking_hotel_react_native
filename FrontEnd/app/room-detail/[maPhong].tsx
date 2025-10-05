import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { PhongServices, PhongData } from "../../services/PhongServices";
import { GiaPhongServices, GiaPhongData } from "../../services/GiaPhongServices";
import { getImageUrl } from "../../utils/getImageUrl";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface RoomData extends PhongData {
  GiaPhongs?: Array<{
    loaiDat: string;
    gia2GioDau: number;
    gia1GioThem: number;
    giaTheoNgay: number;
    giaQuaDem: number;
  }>;
  KhuyenMais?: Array<{
    tenKM: string;
    thongTinKM: string;
    ngayKetThuc: string;
    anh: string;
  }>;
  TienNghis?: Array<{
    tenTienNghi: string;
    moTa: string;
    icon: string;
  }>;
  LoaiPhong?: {
    tenLoaiPhong: string;
  };
  KhachSan?: {
    tenKS: string;
    diaChi: string;
    hangSao: number;
    anh: string;
  };
}

export default function RoomDetailScreen() {
  const { maPhong } = useLocalSearchParams();
  const router = useRouter();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [giaPhongs, setGiaPhongs] = useState<GiaPhongData[]>([]);

  useEffect(() => {
    if (maPhong) {
      loadRoomDetail();
    }
  }, [maPhong]);

  const loadRoomDetail = async () => {
    try {
      setLoading(true);
      
      // Load room data
      const roomData = await PhongServices.getById(maPhong as string);
      setRoom(roomData);
      
      // Load pricing data
      const pricingData = await GiaPhongServices.getByMaPhong(maPhong as string);
      setGiaPhongs(pricingData);
      
    } catch (error) {
      console.error("Error loading room detail:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin phòng");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleBookRoom = () => {
    if (!room) return;

    Alert.alert("Đặt phòng", `Bạn có muốn đặt ${room.tenPhong}?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đặt phòng",
        onPress: () => {
          Alert.alert("Thành công", "Đặt phòng thành công!");
        },
      },
    ]);
  };

  const getRoomPricing = () => {
    if (giaPhongs && giaPhongs.length > 0) {
      const pricing = giaPhongs[0]; // Lấy giá phòng đầu tiên
      return {
        hourly2Hours: pricing.gia2GioDau || 0,
        hourlyAdditional: pricing.gia1GioThem || 0,
        overnight: pricing.giaQuaDem || 0,
        daily: pricing.giaTheoNgay || 0,
      };
    }
    return {
      hourly2Hours: 0,
      hourlyAdditional: 0,
      overnight: 0,
      daily: 0,
    };
  };

  const ImageSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    // Tạo danh sách ảnh từ dữ liệu phòng
    const images = room ? (Array.isArray(room.anh)
      ? room.anh.map((img) => getImageUrl(img))
      : [
          getImageUrl(room.anh) ||
            "https://via.placeholder.com/400x320/6B7280/FFFFFF?text=No+Image",
        ]) : [];

    // Auto-scroll effect
    useEffect(() => {
      if (!room || images.length <= 1) return;

      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % images.length;
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, 2000); // 2 giây

      return () => clearInterval(interval);
    }, [room, images.length]);

    if (!room) return null;

    const onViewableItemsChanged = ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index);
      }
    };

    const viewabilityConfig = {
      itemVisiblePercentThreshold: 50,
    };

    return (
      <View style={{ position: "relative" }}>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{
                width: SCREEN_WIDTH,
                height: 320,
              }}
              resizeMode="cover"
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          onScrollToIndexFailed={(info) => {
            // Fallback khi scrollToIndex thất bại
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            });
          }}
        />

        {/* Image indicators */}
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          {images.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  index === currentIndex ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>
      </View>
    );
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
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Đang tải...</Text>
        </View>
      </View>
    );
  }

  const pricing = getRoomPricing();
  const currentHourPrice = pricing.hourly2Hours;
  const discountPercent = 1;
  const discountedPrice = currentHourPrice > 0 
    ? currentHourPrice - Math.floor(currentHourPrice * 0.01)
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header with Image Slider */}
        <View style={{ position: "relative" }}>
          <ImageSlider />

          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            style={{
              position: "absolute",
              top: Platform.OS === "ios" ? 60 : 40,
              left: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.9)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          {/* Header Title */}
          <View
            style={{
              position: "absolute",
              top: Platform.OS === "ios" ? 60 : 40,
              left: 70,
            }}
          >
            <Text style={{ fontSize: 16, color: "#FFFFFF", fontWeight: "600" }}>
              {room?.tenPhong || "Phòng của sổ đón nắng tự nhiên"}
            </Text>
          </View>
        </View>

        <View style={{ padding: 16 }}>
          {/* Room Title */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#1F2937",
              marginBottom: 8,
            }}
          >
            {room?.tenPhong || "Phòng của sổ đón nắng tự nhiên"}
          </Text>

          {/* Room Details */}
          <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}>
            {room?.dienTich} • {room?.moTa}
          </Text>

          {/* Discount Tag */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <View
              style={{
                backgroundColor: "#FB923C",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                marginRight: 8,
              }}
            >
              <Ionicons name="pricetag" size={16} color="#FFFFFF" />
            </View>
            <Text style={{ fontSize: 14, color: "#FB923C", fontWeight: "600" }}>
              Giảm 27K, đặt tối thiểu 150K
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#FB923C"
              style={{ marginLeft: "auto" }}
            />
          </View>

          {/* Booking Benefits */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              Quyền lợi đặt phòng
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F3F4F6",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              </View>
              <Text style={{ fontSize: 16, color: "#1F2937" }}>
                Tất cả phương thức thanh toán
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F3F4F6",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="star-outline" size={18} color="#FB923C" />
              </View>
              <Text style={{ fontSize: 16, color: "#1F2937" }}>
                Nhận thưởng lên đến 5.980 Joy Xu
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F3F4F6",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="pricetag-outline" size={18} color="#FB923C" />
              </View>
              <Text style={{ fontSize: 16, color: "#1F2937" }}>
                Nhận ưu đãi hấp dẫn khi hoàn thành nhận phòng
              </Text>
            </View>
          </View>

          {/* Room Amenities */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              Tiện ích phòng
            </Text>

            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 8,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#F3F4F6",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <Text style={{ fontSize: 16, color: "#1F2937" }}>
                Tiện nghi đầy đủ
              </Text>
            </View>
          </View>

          {/* Room Pricing */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              Giá phòng
            </Text>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#FEF3E7",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons
                    name="hourglass-outline"
                    size={20}
                    color="#FB923C"
                  />
                </View>
                <Text style={{ fontSize: 16, color: "#1F2937", flex: 1 }}>
                  02 giờ đầu
                </Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}
                >
                  {pricing.hourly2Hours > 0 ? pricing.hourly2Hours.toLocaleString("vi-VN") + "₫" : "Chưa có giá"}
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#F3F4F6",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#6B7280",
                    }}
                  >
                    +
                  </Text>
                </View>
                <Text style={{ fontSize: 16, color: "#1F2937", flex: 1 }}>
                  01 giờ thêm
                </Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}
                >
                  {pricing.hourlyAdditional > 0 ? pricing.hourlyAdditional.toLocaleString("vi-VN") + "₫" : "Chưa có giá"}
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#FEF3E7",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="moon-outline" size={20} color="#FB923C" />
                </View>
                <Text style={{ fontSize: 16, color: "#1F2937", flex: 1 }}>
                  01 đêm
                </Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}
                >
                  {pricing.overnight > 0 ? pricing.overnight.toLocaleString("vi-VN") + "₫" : "Chưa có giá"}
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#FEF3E7",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="business-outline" size={20} color="#FB923C" />
                </View>
                <Text style={{ fontSize: 16, color: "#1F2937", flex: 1 }}>
                  01 ngày
                </Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}
                >
                  {pricing.daily > 0 ? pricing.daily.toLocaleString("vi-VN") + "₫" : "Chưa có giá"}
                </Text>
              </View>
            </View>
          </View>

          {/* Check-in/Check-out Times */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              Giờ nhận phòng/trả phòng
            </Text>

            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 8,
                padding: 16,
                marginBottom: 140,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}
                >
                  Loại đặt phòng
                </Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}
                >
                  Thời gian
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 16, color: "#1F2937" }}>Theo giờ</Text>
                <Text style={{ fontSize: 16, color: "#1F2937" }}>
                  Từ 08:00 đến 22:00
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 16, color: "#1F2937" }}>Qua đêm</Text>
                <Text style={{ fontSize: 16, color: "#1F2937" }}>
                  Từ 22:00 đến 09:00
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 16, color: "#1F2937" }}>
                  Theo ngày
                </Text>
                <Text style={{ fontSize: 16, color: "#1F2937" }}>
                  Từ 14:00 đến 12:00
                </Text>
              </View>
            </View>
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
          borderTopColor: "#F3F4F6",
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: "#FEF3E7",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginRight: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons name="hourglass-outline" size={16} color="#FB923C" />
                <Text style={{ fontSize: 14, color: "#FB923C", marginLeft: 4 }}>
                  02 giờ | 18:00 → 20:00, 04/10
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: "#EF4444",
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Chỉ còn 1 phòng
            </Text>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 4,
              }}
            >
              {discountedPrice > 0 ? discountedPrice.toLocaleString("vi-VN") + "₫" : "Chưa có giá"}
            </Text>
            {currentHourPrice > 0 && (
              <Text
                style={{
                  fontSize: 14,
                  color: "#9CA3AF",
                  textDecorationLine: "line-through",
                }}
              >
                {currentHourPrice.toLocaleString("vi-VN")}₫
              </Text>
            )}
          </View>

          {/* Book Button */}
          <TouchableOpacity
            onPress={handleBookRoom}
            style={{
              backgroundColor: "#FB923C",
              borderRadius: 25,
              paddingHorizontal: 32,
              paddingVertical: 16,
              shadowColor: "#FB923C",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Đặt phòng
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
