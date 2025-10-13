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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { PhongServices, PhongData } from "../../services/PhongServices";
import {
  GiaPhongServices,
  GiaPhongData,
} from "../../services/GiaPhongServices";
import {
  KhuyenMaiServices,
  KhuyenMaiData,
} from "../../services/KhuyenMaiServices";
import { KhachSanServices } from "../../services/KhachSanServices";
import { getImageUrl } from "../../utils/getImageUrl";
import CustomDateTimePicker from "../../components/DateTimePicker";

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
    moTa?: string;
    icon?: string;
    maTienNghi?: string;
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
  const [showPromotionsModal, setShowPromotionsModal] = useState(false);
  const [promotions, setPromotions] = useState<KhuyenMaiData[]>([]);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
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
    if (maPhong) {
      loadRoomDetail();
      loadPromotions();
    }
  }, [maPhong]);

  const loadRoomDetail = async () => {
    try {
      setLoading(true);

      // Load room data
      const roomData = await PhongServices.getById(maPhong as string);
      setRoom(roomData);

      // Load pricing data
      const pricingData = await GiaPhongServices.getByMaPhong(
        maPhong as string
      );
      setGiaPhongs(pricingData);

      // Load hotel data if room has hotel info
      if (roomData?.maKS) {
        try {
          const hotelData = await KhachSanServices.getById(roomData.maKS);
          // Update room with hotel data
          setRoom((prevRoom) => {
            if (!prevRoom) return prevRoom;
            return {
              ...prevRoom,
              KhachSan: hotelData,
            } as unknown as RoomData;
          });
        } catch (hotelError) {
          console.warn("Could not load hotel data:", hotelError);
          // Continue without hotel data
        }
      }
    } catch (error) {
      console.error("Error loading room detail:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin phòng");
      router.back();
    } finally {
      setLoading(false);
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

  const handleViewAmenities = () => {
    setShowAmenitiesModal(true);
  };

  // Removed handleSelectPromotion - chỉ hiển thị thông tin khuyến mãi

  const calculatePriceWithPromotion = (basePrice: number) => {
    if (!selectedPromotion) {
      return basePrice;
    }

    console.log("Calculating price with promotion:", {
      basePrice,
      promotion: selectedPromotion.thongTinKM,
      selectedPromotion,
    });

    // Parse discount from thongTinKM (e.g., "giảm 40K" -> 40000)
    const discountMatch = selectedPromotion.thongTinKM?.match(/giảm\s*(\d+)k/i);
    if (discountMatch) {
      const discountAmount = parseInt(discountMatch[1]) * 1000; // Convert to VND
      const finalPrice = Math.max(0, basePrice - discountAmount);
      console.log("Discount applied:", { discountAmount, finalPrice });
      return finalPrice;
    }

    console.log("No discount match found, returning base price:", basePrice);
    return basePrice;
  };

  const getPromotionText = () => {
    if (!selectedPromotion) return null;
    return selectedPromotion.thongTinKM || "Đã áp dụng khuyến mãi";
  };

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

  const handleBack = () => {
    router.back();
  };

  const handleBookRoom = () => {
    if (!room) return;

    // Ensure we have a valid hotel ID
    const hotelId = (room.KhachSan as any)?.maKS || "1";

    // Format dates properly for backend
    const now = new Date();
    const checkInDate = new Date(now);
    let checkOutDate: Date;

    // Tính check-out date dựa trên loại đặt phòng
    if (selectedDateTime.bookingType === "hourly") {
      checkOutDate = new Date(
        now.getTime() + selectedDateTime.duration * 60 * 60 * 1000
      );
    } else if (selectedDateTime.bookingType === "overnight") {
      checkOutDate = new Date(now);
      checkOutDate.setDate(checkOutDate.getDate() + 1);
      checkOutDate.setHours(9, 0, 0, 0); // 09:00
    } else if (selectedDateTime.bookingType === "daily") {
      // Cho "theo ngày", sử dụng thời gian do người dùng chọn
      try {
        console.log("Parsing daily checkout:", {
          endTime: selectedDateTime.endTime,
          date: selectedDateTime.date,
        });

        const [endHour, endMinute] = selectedDateTime.endTime.split(":");

        // Xử lý cả format "dd/mm" và "dd-mm"
        let day, month;
        if (selectedDateTime.date.includes("/")) {
          [day, month] = selectedDateTime.date.split("/");
        } else if (selectedDateTime.date.includes("-")) {
          [day, month] = selectedDateTime.date.split("-");
        } else {
          throw new Error("Invalid date format");
        }

        // Validation
        if (!endHour || !endMinute || !day || !month) {
          throw new Error("Missing time or date components");
        }

        const hour = parseInt(endHour);
        const minute = parseInt(endMinute);
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);

        // Validation values
        if (isNaN(hour) || isNaN(minute) || isNaN(dayNum) || isNaN(monthNum)) {
          throw new Error("Invalid numeric values");
        }

        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
          throw new Error("Invalid time values");
        }

        if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) {
          throw new Error("Invalid date values");
        }

        // Tạo ngày với năm hiện tại để tránh lỗi "Date value out of bounds"
        const currentYear = new Date().getFullYear();
        checkOutDate = new Date(currentYear, monthNum - 1, dayNum);
        checkOutDate.setHours(hour, minute, 0, 0);

        // Kiểm tra nếu ngày không hợp lệ
        if (isNaN(checkOutDate.getTime())) {
          throw new Error("Invalid date");
        }
      } catch (error) {
        console.error("Error parsing checkout date:", error);
        // Fallback nếu parse lỗi
        checkOutDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 ngày
        checkOutDate.setHours(12, 0, 0, 0); // 12:00
      }
    } else {
      checkOutDate = new Date(
        now.getTime() + selectedDateTime.duration * 60 * 60 * 1000
      );
    }

    const bookingData = {
      roomId: room.maPhong,
      hotelId: hotelId,
      checkInDateTime: checkInDate.toISOString(),
      checkOutDateTime: checkOutDate.toISOString(),
      duration: selectedDateTime.duration,
      bookingType: selectedDateTime.bookingType,
      totalAmount: currentPrice,
      promotionId: selectedPromotion?.maKM,
    };

    router.push({
      pathname: "/booking/confirmation",
      params: {
        bookingData: JSON.stringify(bookingData),
      },
    });
  };

  // Move useCallback to top level
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index);
    }
  }, []);

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

  // Function để hiển thị thời gian theo loại đặt phòng
  const getTimeDisplayText = () => {
    switch (selectedDateTime.bookingType) {
      case "hourly":
        return `${selectedDateTime.duration} giờ | ${selectedDateTime.startTime} → ${selectedDateTime.endTime}, ${selectedDateTime.date}`;
      case "overnight":
        // Tính ngày check-out cho qua đêm từ ngày hiện tại
        const overnightDate = new Date();
        overnightDate.setDate(overnightDate.getDate() + 1); // +1 ngày cho check-out
        const overnightDateStr = overnightDate.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        });
        return `Qua đêm | ${selectedDateTime.startTime} → 09:00, ${overnightDateStr}`;
      case "daily":
        // Hiển thị thời gian theo ngày với số ngày và ngày check-out do người dùng chọn
        return `Theo ngày (${selectedDateTime.duration} ngày) | ${selectedDateTime.startTime} → ${selectedDateTime.endTime}, ${selectedDateTime.date}`;
      default:
        return `${selectedDateTime.duration} giờ | ${selectedDateTime.startTime} → ${selectedDateTime.endTime}, ${selectedDateTime.date}`;
    }
  };

  // Function để lấy icon theo loại đặt phòng
  const getBookingTypeIcon = () => {
    switch (selectedDateTime.bookingType) {
      case "hourly":
        return "hourglass-outline";
      case "overnight":
        return "moon-outline";
      case "daily":
        return "business-outline";
      default:
        return "hourglass-outline";
    }
  };

  // Function để tính giá theo loại đặt phòng đã chọn
  const getCurrentPrice = () => {
    const pricing = getRoomPricing();

    switch (selectedDateTime.bookingType) {
      case "hourly":
        // Tính giá theo giờ: 2 giờ đầu + giờ thêm
        if (selectedDateTime.duration <= 2) {
          return pricing.hourly2Hours;
        } else {
          return (
            pricing.hourly2Hours +
            (selectedDateTime.duration - 2) * pricing.hourlyAdditional
          );
        }

      case "overnight":
        return pricing.overnight;

      case "daily":
        // Tính giá theo số ngày đã chọn
        return pricing.daily * selectedDateTime.duration;

      default:
        return pricing.hourly2Hours;
    }
  };

  const ImageSlider = () => {
    const flatListRef = useRef<FlatList>(null);

    // Tạo danh sách ảnh từ dữ liệu phòng
    const images = room
      ? Array.isArray(room.anh)
        ? room.anh.map((img) => getImageUrl(img))
        : [
            getImageUrl(room.anh) ||
              "https://via.placeholder.com/400x320/6B7280/FFFFFF?text=No+Image",
          ]
      : ["https://via.placeholder.com/400x320/6B7280/FFFFFF?text=No+Image"];

    // Auto-scroll effect
    useEffect(() => {
      if (!room || images.length <= 1) return;

      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => {
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

    if (!room) {
      return (
        <View style={{ height: 300, backgroundColor: "#F3F4F6" }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#6B7280" }}>Đang tải ảnh...</Text>
          </View>
        </View>
      );
    }

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
                  index === currentImageIndex
                    ? "#FFFFFF"
                    : "rgba(255,255,255,0.5)",
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

  // Fallback nếu không có dữ liệu phòng
  if (!room) {
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
          <Text>Không tìm thấy thông tin phòng</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 16,
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: "#FB923C",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#FFFFFF" }}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const pricing = getRoomPricing();
  const currentPrice = getCurrentPrice();
  const discountedPrice = selectedPromotion
    ? calculatePriceWithPromotion(currentPrice)
    : currentPrice;

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
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
              Diện tích: {room?.dienTich}
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280", lineHeight: 22 }}>
              {Array.isArray(room.moTa) ? room.moTa.join(" - ") : room.moTa}
            </Text>
          </View>

          {/* Promotion Banner */}
          {promotions && promotions.length > 0 && (
            <TouchableOpacity
              onPress={handleViewPromotions}
              style={{
                backgroundColor: "#FEF3E7",
                padding: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
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
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={{ fontSize: 16, color: "#4B5563", marginLeft: 8 }}>
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
                <Ionicons name="star-outline" size={18} color="#F97316" />
                <Text style={{ fontSize: 16, color: "#4B5563", marginLeft: 8 }}>
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
                <Ionicons name="pricetag-outline" size={18} color="#F97316" />
                <Text style={{ fontSize: 16, color: "#4B5563", marginLeft: 8 }}>
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
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#F97316"
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#4B5563",
                      marginLeft: 8,
                    }}
                  >
                    Chính sách hủy phòng
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Room Amenities */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1F2937",
                }}
              >
                Tiện ích phòng
              </Text>
              <TouchableOpacity onPress={handleViewAmenities}>
                <Text
                  style={{ color: "#FB923C", fontSize: 14, fontWeight: "600" }}
                >
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {(() => {
                const amenities = (room as any)?.TienNghis?.slice(0, 4) || [];
                return amenities;
              })().map((amenity: any, index: number) => (
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
              ))}
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
                  {pricing.hourly2Hours > 0
                    ? pricing.hourly2Hours.toLocaleString("vi-VN") + "₫"
                    : "Chưa có giá"}
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
                  {pricing.hourlyAdditional > 0
                    ? pricing.hourlyAdditional.toLocaleString("vi-VN") + "₫"
                    : "Chưa có giá"}
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
                  {pricing.overnight > 0
                    ? pricing.overnight.toLocaleString("vi-VN") + "₫"
                    : "Chưa có giá"}
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
                  {pricing.daily > 0
                    ? pricing.daily.toLocaleString("vi-VN") + "₫"
                    : "Chưa có giá"}
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
            <Ionicons
              name={getBookingTypeIcon() as any}
              size={16}
              color="#FB923C"
            />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                color: "#FB923C",
                fontWeight: "600",
              }}
            >
              {getTimeDisplayText()}
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
              Giá phòng
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#1F2937",
              }}
            >
              {currentPrice > 0
                ? discountedPrice.toLocaleString("vi-VN") + "₫"
                : "Chưa có giá"}
            </Text>
            {currentPrice > 0 &&
              selectedPromotion &&
              currentPrice !== discountedPrice && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    textDecorationLine: "line-through",
                    marginTop: 2,
                  }}
                >
                  {currentPrice.toLocaleString("vi-VN")}₫
                </Text>
              )}
            {selectedPromotion && currentPrice > 0 && (
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
            onPress={handleBookRoom}
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
              Đặt phòng
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
              Tiện ích phòng
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Amenities Grid */}
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {(
                (room as any)?.TienNghis || [
                  { tenTienNghi: "TV", maTienNghi: "1" },
                  { tenTienNghi: "Wifi", maTienNghi: "2" },
                  { tenTienNghi: "Điều hòa", maTienNghi: "3" },
                  { tenTienNghi: "Bồn tắm", maTienNghi: "4" },
                  { tenTienNghi: "Sân vườn", maTienNghi: "5" },
                  { tenTienNghi: "Cà phê", maTienNghi: "6" },
                  { tenTienNghi: "Nước suối", maTienNghi: "7" },
                  { tenTienNghi: "Móc treo", maTienNghi: "8" },
                  { tenTienNghi: "Netflix", maTienNghi: "9" },
                  { tenTienNghi: "Miễn phí", maTienNghi: "10" },
                ]
              ).map((amenity: any, index: number) => (
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
              ))}
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
                          ? new Date(item.ngayKetThuc).toLocaleDateString(
                              "vi-VN"
                            )
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
                // Cho "theo ngày", sử dụng thời gian do người dùng chọn từ DateTimePicker
                checkoutDate.setTime(data.checkOutDate.getTime());
                checkoutTime.setTime(data.checkOutTime.getTime());
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

          // Tính số ngày cho "theo ngày" dựa trên khoảng cách giữa ngày nhận và ngày trả phòng
          const calculateDaysForDaily = (
            checkInDate: Date,
            checkOutDate: Date
          ) => {
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return Math.max(1, daysDiff); // Ít nhất 1 ngày
          };

          const calculatedDuration =
            data.bookingType === "daily"
              ? calculateDaysForDaily(data.checkInDate, data.checkOutDate)
              : data.duration;

          // Debug log để kiểm tra dữ liệu
          console.log("DateTimePicker data:", {
            checkInDate: data.checkInDate,
            checkOutDate: data.checkOutDate,
            checkInTime: data.checkInTime,
            checkOutTime: data.checkOutTime,
            bookingType: data.bookingType,
            duration: data.duration,
            calculatedDuration,
          });

          console.log("Date strings:", {
            checkInDateStr: data.checkInDate.toLocaleDateString("vi-VN"),
            checkOutDateStr: data.checkOutDate.toLocaleDateString("vi-VN"),
            checkInTimeStr: data.checkInTime.toLocaleTimeString("vi-VN"),
            checkOutTimeStr: data.checkOutTime.toLocaleTimeString("vi-VN"),
          });

          setSelectedDateTime({
            duration: calculatedDuration,
            startTime: data.checkInTime.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            endTime:
              data.bookingType === "daily"
                ? data.checkOutTime.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : checkoutTime.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
            date:
              data.bookingType === "daily"
                ? data.checkOutDate.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                : data.checkInDate.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  }),
            bookingType: data.bookingType,
          });
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
