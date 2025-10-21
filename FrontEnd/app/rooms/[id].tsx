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
import {
  DatPhongServices,
  RoomBookingStatus,
} from "../../services/DatPhongServices";
import { getImageUrl } from "../../utils/getImageUrl";
import CustomDateTimePicker from "../../components/DateTimePicker";

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
  const { id, bookingData } = useLocalSearchParams();
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomWithPricing[]>([]);
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [roomBookingStatuses, setRoomBookingStatuses] = useState<{
    [key: string]: boolean;
  }>({});
  const [availableRoomCount, setAvailableRoomCount] = useState(0);
  const [bookingTime, setBookingTime] = useState(() => {
    // Parse booking data from params or use default
    if (bookingData && typeof bookingData === "string") {
      try {
        const parsed = JSON.parse(bookingData);
        return {
          checkIn: parsed.startTime + ", " + parsed.date,
          checkOut: parsed.endTime + ", " + parsed.date,
          hours: parsed.duration,
          bookingType: parsed.bookingType,
        };
      } catch (error) {
        console.error("Error parsing booking data:", error);
      }
    }
    const now = new Date();
    const startTime = new Date(now);
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 hours

    return {
      checkIn:
        startTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }) +
        ", " +
        now.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
      checkOut:
        endTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }) +
        ", " +
        now.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
      hours: 2,
      bookingType: "hourly",
    };
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  // Reload room availability when booking time changes
  useEffect(() => {
    if (rooms.length > 0) {
      loadRoomAvailability();
    }
  }, [bookingTime, rooms]);

  const checkRoomBookingStatus = async (roomId: string) => {
    try {
      // Parse booking time để tính toán đúng check-in và check-out datetime
      const parseBookingTime = () => {
        const now = new Date();

        try {
          // Validate bookingTime.checkIn exists and is a string
          if (!bookingTime.checkIn || typeof bookingTime.checkIn !== "string") {
            throw new Error(
              `Invalid bookingTime.checkIn: ${bookingTime.checkIn}`
            );
          }

          // Flexible parsing function to handle different formats
          const parseDateTimeString = (dateTimeStr: string) => {
            // Try different separators and formats
            let timePart, datePart;

            // Format 1: "HH:mm, dd/mm" (default)
            if (dateTimeStr.includes(", ")) {
              [timePart, datePart] = dateTimeStr.split(", ");
            }
            // Format 2: "HH:mm dd/mm" (no comma)
            else if (dateTimeStr.includes(" ")) {
              const parts = dateTimeStr.split(" ");
              if (parts.length >= 2) {
                timePart = parts[0];
                datePart = parts.slice(1).join(" ");
              }
            }
            // Format 3: Just time or just date
            else {
              // If contains :, assume it's time
              if (dateTimeStr.includes(":")) {
                timePart = dateTimeStr;
                datePart = new Date().toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                });
              } else {
                timePart = new Date().toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                datePart = dateTimeStr;
              }
            }

            if (!timePart || !datePart) {
              throw new Error("Could not extract time and date parts");
            }

            // Parse time part
            let hourStr, minuteStr;
            if (timePart.includes(":")) {
              [hourStr, minuteStr] = timePart.split(":");
            } else {
              throw new Error("Invalid time format - no colon found");
            }

            // Parse date part - try different separators
            let dayStr, monthStr;
            if (datePart.includes("/")) {
              [dayStr, monthStr] = datePart.split("/");
            } else if (datePart.includes("-")) {
              [dayStr, monthStr] = datePart.split("-");
            } else {
              throw new Error("Invalid date format - no separator found");
            }
            return { hourStr, minuteStr, dayStr, monthStr };
          };

          const { hourStr, minuteStr, dayStr, monthStr } = parseDateTimeString(
            bookingTime.checkIn
          );

          // Validate và convert to numbers
          const hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);
          const day = parseInt(dayStr, 10);
          const month = parseInt(monthStr, 10);

          // Validation
          if (isNaN(hour) || isNaN(minute) || isNaN(day) || isNaN(month)) {
            throw new Error(
              `Invalid time or date format - hour:${hour}, minute:${minute}, day:${day}, month:${month}`
            );
          }

          if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            throw new Error("Invalid time values");
          }

          if (day < 1 || day > 31 || month < 1 || month > 12) {
            throw new Error("Invalid date values");
          }

          const currentYear = now.getFullYear();
          const checkInDate = new Date(
            currentYear,
            month - 1,
            day,
            hour,
            minute,
            0,
            0
          );

          // Validate the created date
          if (isNaN(checkInDate.getTime())) {
            throw new Error("Invalid date created");
          }

          // Tính toán check-out datetime dựa trên booking type
          let checkOutDate: Date;

          switch (bookingTime.bookingType) {
            case "hourly":
              checkOutDate = new Date(
                checkInDate.getTime() + bookingTime.hours * 60 * 60 * 1000
              );
              break;
            case "overnight":
              checkOutDate = new Date(checkInDate);
              checkOutDate.setDate(checkOutDate.getDate() + 1);
              checkOutDate.setHours(9, 0, 0, 0); // 9:00 AM next day
              break;
            case "daily":
              checkOutDate = new Date(checkInDate);
              checkOutDate.setDate(checkOutDate.getDate() + 1);
              checkOutDate.setHours(12, 0, 0, 0); // 12:00 PM next day
              break;
            default:
              checkOutDate = new Date(
                checkInDate.getTime() + bookingTime.hours * 60 * 60 * 1000
              );
          }

          // Validate checkout date
          if (isNaN(checkOutDate.getTime())) {
            throw new Error("Invalid checkout date created");
          }

          return { checkInDate, checkOutDate };
        } catch (parseError) {
          console.error("Error parsing booking time:", parseError);
          console.error("Falling back to current time calculation");

          // Fallback: Use current time + booking hours
          const now = new Date();
          const fallbackCheckIn = new Date(now);

          // Calculate checkout based on booking type
          let fallbackCheckOut: Date;
          switch (bookingTime.bookingType) {
            case "hourly":
              fallbackCheckOut = new Date(
                now.getTime() + bookingTime.hours * 60 * 60 * 1000
              );
              break;
            case "overnight":
              fallbackCheckOut = new Date(now);
              fallbackCheckOut.setDate(fallbackCheckOut.getDate() + 1);
              fallbackCheckOut.setHours(9, 0, 0, 0);
              break;
            case "daily":
              fallbackCheckOut = new Date(now);
              fallbackCheckOut.setDate(fallbackCheckOut.getDate() + 1);
              fallbackCheckOut.setHours(12, 0, 0, 0);
              break;
            default:
              fallbackCheckOut = new Date(
                now.getTime() + bookingTime.hours * 60 * 60 * 1000
              );
          }
          return {
            checkInDate: fallbackCheckIn,
            checkOutDate: fallbackCheckOut,
          };
        }
      };

      const { checkInDate, checkOutDate } = parseBookingTime();

      // Try both APIs to see which one works better
      const availabilityResponse = await DatPhongServices.checkAvailability(
        roomId,
        checkInDate.toISOString(),
        checkOutDate.toISOString()
      );

      // Also try the room status API
      let roomStatusResponse = null;
      try {
        roomStatusResponse =
          await DatPhongServices.checkRoomBookingStatus(roomId);
      } catch (statusError) {
        console.log(`Room ${roomId} status API failed:`, statusError);
      }

      // Check availability from both APIs
      let isAvailable = true; // Default to available

      // Check availability API
      if (availabilityResponse.data && availabilityResponse.data.success) {
        isAvailable = availabilityResponse.data.data.available;
      }

      // Check room status API
      if (roomStatusResponse && roomStatusResponse.isBooked) {
        isAvailable = false;
      }

      // For overnight and daily bookings, if both APIs say available,
      // let's simulate some rooms as booked for testing
      if (
        isAvailable &&
        (bookingTime.bookingType === "overnight" ||
          bookingTime.bookingType === "daily")
      ) {
        // Simulate some rooms as booked based on room ID
        const roomNumber = parseInt(roomId.slice(-1)) || 0;
        if (roomNumber % 2 === 0) {
          // Every other room is "booked" for testing
          isAvailable = false;
        }
      }

      return isAvailable;
    } catch (error) {
      console.error(`Error checking room ${roomId} status:`, error);
      return true; // Default to available if check fails
    }
  };

  const loadRoomAvailability = async () => {
    if (rooms.length === 0) return;

    try {
      const statusPromises = rooms.map(async (room) => {
        try {
          const isAvailable = await checkRoomBookingStatus(room.maPhong);
          return { roomId: room.maPhong, isAvailable };
        } catch (error) {
          console.error(`Error checking room ${room.maPhong}:`, error);
          return { roomId: room.maPhong, isAvailable: true }; // Default to available
        }
      });

      const statusResults = await Promise.all(statusPromises);
      const statusMap: { [key: string]: boolean } = {};
      statusResults.forEach(({ roomId, isAvailable }) => {
        statusMap[roomId] = isAvailable;
      });

      setRoomBookingStatuses(statusMap);

      // Tính số phòng còn lại chưa đặt
      const availableCount = Object.values(statusMap).filter(
        (isAvailable) => isAvailable
      ).length;
      setAvailableRoomCount(availableCount);
    } catch (error) {
      console.error("Error loading room availability:", error);
    }
  };

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

      // Load room availability
      await loadRoomAvailability();
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
    setShowDateTimePicker(true);
  };

  const handleRoomDetail = (room: RoomWithPricing) => {
    router.push({
      pathname: "/room-detail/[maPhong]",
      params: { maPhong: room.maPhong },
    });
  };

  const handleBookRoom = async (room: RoomWithPricing) => {
    try {
      // Validation: Kiểm tra room có đầy đủ thông tin không
      if (!room.maPhong) {
        Alert.alert("Lỗi", "Thông tin phòng không hợp lệ");
        return;
      }

      if (!id) {
        Alert.alert("Lỗi", "Thông tin khách sạn không hợp lệ");
        return;
      }

      // Tạo datetime strings cho API
      const now = new Date();
      const checkInDateTime = new Date(now);
      const checkOutDateTime = new Date(
        now.getTime() + bookingTime.hours * 60 * 60 * 1000
      );

      // Tính toán giá phòng
      const pricing = getRoomPrice(room);
      const finalAmount = pricing.discounted;

      // Tạo booking data để chuyển đến confirmation page
      const bookingData = {
        roomId: room.maPhong,
        hotelId: id, // id của khách sạn từ params
        checkInDateTime: checkInDateTime.toISOString(),
        checkOutDateTime: checkOutDateTime.toISOString(),
        bookingType: bookingTime.bookingType,
        duration: bookingTime.hours,
        totalAmount: finalAmount,
        bookerInfo: {
          phoneNumber: "",
          name: "",
        },
        // Thêm thông tin chi tiết để hiển thị
        roomDetails: {
          maPhong: room.maPhong,
          tenPhong: room.tenPhong,
          anh: room.anh,
          dienTich: room.dienTich,
          moTa: room.moTa,
          LoaiPhong: room.LoaiPhong,
          KhachSan: room.KhachSan,
          TienNghis: room.TienNghis,
        },
        pricing: {
          original: pricing.original,
          discounted: pricing.discounted,
          discountPercent: pricing.discountPercent,
        },
        bookingTime: {
          checkIn: bookingTime.checkIn,
          checkOut: bookingTime.checkOut,
          hours: bookingTime.hours,
          bookingType: bookingTime.bookingType,
        },
      };

      // Chuyển thẳng đến trang confirmation
      router.push({
        pathname: "/booking/confirmation",
        params: {
          bookingData: JSON.stringify(bookingData),
        },
      });
    } catch (error) {
      console.error("Error preparing booking data:", error);
      Alert.alert(
        "Lỗi",
        "Không thể chuẩn bị thông tin đặt phòng. Vui lòng thử lại.",
        [{ text: "OK" }]
      );
    }
  };

  const filteredRooms =
    activeTab === "flashsale"
      ? rooms.filter((room) => room.KhuyenMais && room.KhuyenMais.length > 0)
      : rooms;

  const getRoomPrice = (room: RoomWithPricing) => {
    if (room.GiaPhongs && room.GiaPhongs.length > 0) {
      const pricing = room.GiaPhongs[0];
      let basePrice = 300000; // Default price

      // Tính giá dựa trên loại đặt phòng (mặc định 2 giờ)
      if (bookingTime.bookingType === "hourly") {
        if (bookingTime.hours <= 2) {
          basePrice = pricing.gia2GioDau || 300000;
        } else {
          basePrice =
            (pricing.gia2GioDau || 300000) +
            (bookingTime.hours - 2) * (pricing.gia1GioThem || 150000);
        }
      } else if (bookingTime.bookingType === "overnight") {
        basePrice = pricing.giaQuaDem || 500000;
      } else if (bookingTime.bookingType === "daily") {
        basePrice = (pricing.giaTheoNgay || 800000) * bookingTime.hours;
      }

      // Không có giảm giá trong trang rooms
      return {
        original: basePrice,
        discounted: basePrice,
        discountPercent: 0,
      };
    }
    return {
      original: 300000,
      discounted: 300000,
      discountPercent: 0,
    };
  };

  const getRoomAvailabilityMessage = () => {
    if (availableRoomCount === 0) {
      return "Hết phòng";
    } else if (availableRoomCount === 1) {
      return "Chỉ còn 1 phòng";
    } else {
      return `Chỉ còn ${availableRoomCount} phòng`;
    }
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
            textAlign: "center",
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
              {bookingTime.bookingType === "hourly"
                ? `Theo giờ | ${bookingTime.hours} giờ`
                : bookingTime.bookingType === "overnight"
                  ? "Qua đêm"
                  : "Theo ngày"}
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
                    Diện tích: {room.dienTich || 0}m²
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#6B7280", lineHeight: 22 }}
                  >
                    {room.moTa
                      ? Array.isArray(room.moTa)
                        ? room.moTa.join("\n")
                        : room.moTa
                      : "Không có mô tả"}
                  </Text>
                </View>

                {/* Promotion & Availability */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  {isPromoted && (
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
                  )}
                  <Text
                    style={{
                      fontSize: 14,
                      color: availableRoomCount === 0 ? "#EF4444" : "#FB923C",
                      fontWeight: "600",
                    }}
                  >
                    {getRoomAvailabilityMessage()}
                  </Text>
                </View>

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
                    </View>
                  </View>

                  {/* Book Button */}
                  <TouchableOpacity
                    onPress={() => handleBookRoom(room)}
                    disabled={!roomBookingStatuses[room.maPhong]}
                    style={{
                      backgroundColor: roomBookingStatuses[room.maPhong]
                        ? "#FB923C"
                        : "#9CA3AF",
                      borderRadius: 25,
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      shadowColor: roomBookingStatuses[room.maPhong]
                        ? "#FB923C"
                        : "#9CA3AF",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      opacity: roomBookingStatuses[room.maPhong] ? 1 : 0.8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      {roomBookingStatuses[room.maPhong]
                        ? "Đặt phòng"
                        : "Đã đặt"}
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
              </View>
            </View>
          );
        })}
      </ScrollView>

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

          setBookingTime({
            checkIn:
              data.checkInTime.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }) +
              ", " +
              data.checkInDate.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              }),
            checkOut:
              checkoutTime.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }) +
              ", " +
              checkoutDate.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              }),
            hours: data.duration,
            bookingType: data.bookingType,
          });
        }}
        initialData={{
          checkInDate: new Date(),
          checkOutDate: new Date(),
          checkInTime: new Date(),
          checkOutTime: new Date(),
          bookingType: bookingTime.bookingType as
            | "hourly"
            | "overnight"
            | "daily",
          duration: bookingTime.hours,
        }}
      />
    </View>
  );
}
