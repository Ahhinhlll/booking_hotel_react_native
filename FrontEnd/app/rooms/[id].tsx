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
import { useState, useEffect, useRef, useCallback } from "react";
import { PhongServices, PhongData } from "../../services/PhongServices";
import { KhachSanServices } from "../../services/KhachSanServices";
import { getImageUrl } from "../../utils/getImageUrl";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface RoomWithPricing extends PhongData {
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
  KhachSan?: {
    tenKS: string;
    diaChi: string;
  };
  LoaiPhong?: {
    tenLoaiPhong: string;
  };
  TienNghis?: Array<{
    tenTienNghi: string;
  }>;
}

export default function RoomListScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomWithPricing[]>([]);
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [bookingTime, setBookingTime] = useState({
    checkIn: "18:00, 04/10",
    checkOut: "20:00, 04/10",
    hours: 2,
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      if (!id || typeof id !== "string") {
        Alert.alert("Lỗi", "Thiếu mã khách sạn hoặc mã không hợp lệ");
        router.back();
        return;
      }

      setLoading(true);

      // Load hotel info for header
      const hotelData = await KhachSanServices.getById(id);
      setHotel(hotelData);

      // Load rooms for this hotel
      const roomList = await PhongServices.getByKhachSan(id);

      setRooms(roomList);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleChangeBookingTime = () => {
    Alert.alert("Thay đổi thời gian", "Chức năng sẽ được cập nhật");
  };

  const handleRoomDetail = (room: RoomWithPricing) => {
    router.push({
      pathname: "/room-detail/[maPhong]",
      params: { maPhong: room.maPhong },
    });
  };

  const handleBookRoom = (room: RoomWithPricing) => {
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

  const filteredRooms =
    activeTab === "flashsale"
      ? rooms.filter((room) => room.KhuyenMais && room.KhuyenMais.length > 0)
      : rooms;

  const getRoomPrice = (room: RoomWithPricing) => {
    if (room.GiaPhongs && room.GiaPhongs.length > 0) {
      const hourlyPrice = room.GiaPhongs[0].gia2GioDau;
      return {
        original: hourlyPrice || 300000,
        discounted: hourlyPrice && hourlyPrice - Math.floor(hourlyPrice * 0.01),
        discountPercent: 1,
      };
    }
    return {
      original: 300000,
      discounted: 299000,
      discountPercent: 1,
    };
  };

  const hasPromotion = (room: RoomWithPricing) => {
    return room.KhuyenMais && room.KhuyenMais.length > 0;
  };

  const ImageSlider = ({ room }: { room: RoomWithPricing }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    // Tạo danh sách ảnh từ dữ liệu phòng
    const images = Array.isArray(room.anh)
      ? room.anh.map((img) => getImageUrl(img))
      : [
          getImageUrl(room.anh) ||
            "https://via.placeholder.com/400x300/6B7280/FFFFFF?text=No+Image",
        ];

    // Auto-scroll effect
    useEffect(() => {
      if (images.length <= 1) return;

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
    }, [images.length]);

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index);
      }
    }, []);

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
                width: SCREEN_WIDTH - 32,
                height: 280,
                borderRadius: 12,
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
            bottom: 12,
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
                  index === currentIndex ? "#FB923C" : "rgba(255,255,255,0.5)",
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

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
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
          backgroundColor: "#FFFFFF",
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#333",
            marginLeft: 16,
            flex: 1,
          }}
        >
          Danh sách phòng
        </Text>
      </View>

      {/* Booking Summary Bar */}
      <View
        style={{
          backgroundColor: "#F8F9FA",
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Ionicons name="hourglass-outline" size={20} color="#FB923C" />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 16,
                fontWeight: "600",
                color: "#1F2937",
              }}
            >
              Theo giờ | {bookingTime.hours} giờ
            </Text>
            <TouchableOpacity
              style={{ marginLeft: "auto" }}
              onPress={handleChangeBookingTime}
            >
              <Text
                style={{ color: "#FB923C", fontSize: 14, fontWeight: "600" }}
              >
                Thay đổi
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ fontSize: 12, color: "#6B7280" }}>Nhận phòng</Text>
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}
              >
                {bookingTime.checkIn}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#6B7280" />
            <View>
              <Text style={{ fontSize: 12, color: "#6B7280" }}>Trả phòng</Text>
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}
              >
                {bookingTime.checkOut}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tab Filter */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab("all")}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderBottomWidth: activeTab === "all" ? 2 : 0,
            borderBottomColor: "#FB923C",
            marginRight: 24,
          }}
        >
          <Text
            style={{
              color: activeTab === "all" ? "#FB923C" : "#6B7280",
              fontWeight: activeTab === "all" ? "600" : "normal",
              fontSize: 16,
            }}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("flashsale")}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderBottomWidth: activeTab === "flashsale" ? 2 : 0,
            borderBottomColor: "#FB923C",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="flash"
            size={16}
            color={activeTab === "flashsale" ? "#FB923C" : "#6B7280"}
          />
          <Text
            style={{
              color: activeTab === "flashsale" ? "#FB923C" : "#6B7280",
              fontWeight: activeTab === "flashsale" ? "600" : "normal",
              marginLeft: 4,
              fontSize: 16,
            }}
          >
            Flash Sale
          </Text>
        </TouchableOpacity>
      </View>

      {/* Room List */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {filteredRooms.map((room) => {
          const pricing = getRoomPrice(room);
          const isPromoted = hasPromotion(room);

          return (
            <View
              key={room.maPhong}
              style={{
                backgroundColor: "#FFFFFF",
                marginHorizontal: 16,
                marginTop: 16,
                borderRadius: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {/* Room Image Slider */}
              <ImageSlider room={room} />

              {/* Room Info */}
              <View style={{ padding: 16 }}>
                {/* Room Title */}
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#1F2937",
                    marginBottom: 8,
                    lineHeight: 24,
                  }}
                >
                  {room.tenPhong || "Phòng của sổ đón nắng tự nhiên"}
                </Text>

                {/* Room Details */}
                <View style={{ height: 40, marginBottom: 26 }}>
                  <Text style={{ fontSize: 14, color: "#6B7280" }}>
                    {room.dienTich}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#6B7280" }}>
                    {room.moTa}
                  </Text>
                </View>

                {/* Promotion & Availability */}
                {isPromoted && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#FB923C",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 8,
                      }}
                    >
                      <Ionicons name="flash" size={12} color="#FFFFFF" />
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 12,
                          fontWeight: "600",
                          marginLeft: 4,
                        }}
                      >
                        Flash Sale
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#EF4444",
                        fontWeight: "600",
                      }}
                    >
                      Chỉ còn 1 phòng
                    </Text>
                  </View>
                )}

                {/* Pricing */}
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
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "bold",
                          color: "#1F2937",
                        }}
                      >
                        {pricing.discounted.toLocaleString("vi-VN")}₫
                      </Text>
                      <View
                        style={{
                          backgroundColor: "#10B981",
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                          marginLeft: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: "#FFFFFF",
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          -{pricing.discountPercent}%
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#9CA3AF",
                        textDecorationLine: "line-through",
                      }}
                    >
                      {pricing.original.toLocaleString("vi-VN")}₫
                    </Text>
                  </View>

                  {/* Book Button */}
                  <TouchableOpacity
                    onPress={() => handleBookRoom(room)}
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
                      style={{
                        color: "#FFFFFF",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      Đặt phòng
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Additional Info */}
                <View
                  style={{
                    backgroundColor: "#F9FAFB",
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#6B7280"
                    />
                    <Text
                      style={{ fontSize: 14, color: "#6B7280", marginLeft: 8 }}
                    >
                      Tất cả phương thức thanh toán
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons name="star-outline" size={16} color="#6B7280" />
                    <Text
                      style={{ fontSize: 14, color: "#6B7280", marginLeft: 8 }}
                    >
                      Nhận thưởng lên đến 5.980 Joy Xu
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons
                      name="pricetag-outline"
                      size={16}
                      color="#6B7280"
                    />
                    <Text
                      style={{ fontSize: 14, color: "#6B7280", marginLeft: 8 }}
                    >
                      Nhận ưu đãi hấp dẫn khi hoàn thành nhận phòng
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={16}
                        color="#6B7280"
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#6B7280",
                          marginLeft: 8,
                        }}
                      >
                        Chính sách hủy phòng
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRoomDetail(room)}>
                      <Text
                        style={{
                          color: "#FB923C",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        Chi tiết phòng {">"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Show More */}
                <TouchableOpacity
                  style={{
                    alignItems: "center",
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ color: "#6B7280", fontSize: 14 }}>
                    Hiển thị thêm
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color="#6B7280"
                    style={{ marginTop: 4 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
