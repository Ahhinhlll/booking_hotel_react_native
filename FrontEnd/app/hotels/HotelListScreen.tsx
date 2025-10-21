import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"; // 🔥 sửa: thêm SafeAreaView
import FilterModal from "../../components/FilterModal";
import SortModal from "../../components/SortModal";
import {
  KhachSanData,
  KhachSanServices,
} from "../../services/KhachSanServices";
import { PhongServices } from "../../services/PhongServices";
import {
  DatPhongServices,
  DatPhongData,
} from "../../services/DatPhongServices";
import { getImageUrl } from "../../utils/getImageUrl";
import {
  FilterOptions,
  SortOptions,
  DEFAULT_FILTER_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  SORT_OPTIONS,
} from "../../types/filterTypes";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HotelListScreen() {
  const router = useRouter();
  const [hotels, setHotels] = useState<KhachSanData[]>([]);
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(
    DEFAULT_FILTER_OPTIONS
  );
  const [sortOptions, setSortOptions] =
    useState<SortOptions>(DEFAULT_SORT_OPTIONS);
  const [roomsData, setRoomsData] = useState<any[]>([]);
  const [bookingsData, setBookingsData] = useState<DatPhongData[]>([]);

  useEffect(() => {
    loadHotels();
    loadRoomsData();
    loadBookingsData();
  }, []);

  const loadHotels = async () => {
    try {
      const data = await KhachSanServices.getAll();
      setHotels(data);
    } catch (error) {
      console.error("Error loading hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoomsData = async () => {
    try {
      const data = await PhongServices.getAll();
      setRoomsData(data);
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  };

  const loadBookingsData = async () => {
    try {
      const data = await DatPhongServices.getAll();
      setBookingsData(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  // Function to get available rooms count for a hotel
  const getAvailableRoomsCount = (hotelId: string) => {
    const hotelRooms = roomsData.filter((room) => room.maKS === hotelId);

    // Lấy danh sách phòng đã được đặt từ bảng datphong
    const bookedRoomIds = bookingsData
      .filter(
        (booking) =>
          booking.trangThai !== "Đã hủy" && booking.trangThai !== "Hoàn thành"
      )
      .map((booking) => booking.maPhong);

    // Chỉ tính phòng có thể đặt được: có giá phòng và chưa được đặt
    const availableRooms = hotelRooms.filter((room) => {
      const isBooked = bookedRoomIds.includes(room.maPhong);
      const hasPrice = room.gia > 0;
      const isAvailable = !isBooked && hasPrice;
      return isAvailable;
    });

    return availableRooms.length;
  };

  // Function to get total rooms count for a hotel
  const getTotalRoomsCount = (hotelId: string) => {
    const hotelRooms = roomsData.filter((room) => room.maKS === hotelId);
    return hotelRooms.length;
  };

  // Function to get booked rooms count for a hotel
  const getBookedRoomsCount = (hotelId: string) => {
    const hotelRooms = roomsData.filter((room) => room.maKS === hotelId);

    // Đếm số phòng đã được đặt từ bảng datphong
    const bookedRoomIds = bookingsData
      .filter(
        (booking) =>
          booking.maKS === hotelId &&
          booking.trangThai !== "Đã hủy" &&
          booking.trangThai !== "Hoàn thành"
      )
      .map((booking) => booking.maPhong);

    // Loại bỏ duplicate và đếm
    const uniqueBookedRooms = [...new Set(bookedRoomIds)];
    return uniqueBookedRooms.length;
  };

  // Filter hotels based on current filter options
  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      // Filter by price range
      if (hotel.giaThapNhat) {
        const price = hotel.giaThapNhat;
        if (
          price < filterOptions.priceRange[0] ||
          price > filterOptions.priceRange[1]
        ) {
          return false;
        }
      }

      // Filter by rating
      if (filterOptions.selectedRatings.length > 0) {
        const hotelRating = hotel.hangSao || 0;
        const hasMatchingRating = filterOptions.selectedRatings.some(
          (rating) => {
            const minRating = parseFloat(rating);
            return hotelRating >= minRating;
          }
        );
        if (!hasMatchingRating) return false;
      }

      // Filter by clean rating
      if (filterOptions.selectedClean.length > 0) {
        const hotelCleanRating = hotel.diemDanhGia || 0;
        const hasMatchingCleanRating = filterOptions.selectedClean.some(
          (cleanRating) => {
            const minCleanRating = parseFloat(cleanRating);
            return hotelCleanRating >= minCleanRating;
          }
        );
        if (!hasMatchingCleanRating) return false;
      }

      // Filter by hotel type/status
      if (filterOptions.selectedTypes.length > 0) {
        const hotelStatus = hotel.trangThai || "";
        const hasMatchingType = filterOptions.selectedTypes.some((type) => {
          return hotelStatus.toLowerCase().includes(type.toLowerCase());
        });
        if (!hasMatchingType) return false;
      }

      // Filter by facilities
      if (filterOptions.selectedFacilities.length > 0) {
        const hotelFacilities = hotel.TienNghis || [];
        const facilityNames = hotelFacilities.map(
          (facility: any) => facility.tenTN || ""
        );
        const hasMatchingFacility = filterOptions.selectedFacilities.some(
          (facility) => {
            return facilityNames.some((name: string) =>
              name.toLowerCase().includes(facility.toLowerCase())
            );
          }
        );
        if (!hasMatchingFacility) return false;
      }

      return true;
    });
  }, [hotels, filterOptions]);

  // Sort hotels based on current sort options
  const sortedHotels = useMemo(() => {
    const hotelsToSort = [...filteredHotels];

    switch (sortOptions.sortBy) {
      case "relevance":
        // Keep original order for relevance
        return hotelsToSort;

      case "distance":
        // Mock distance calculation (you can implement real distance calculation)
        return hotelsToSort.sort((a, b) => {
          const distanceA = Math.random() * 20; // Mock distance
          const distanceB = Math.random() * 20;
          return sortOptions.sortOrder === "asc"
            ? distanceA - distanceB
            : distanceB - distanceA;
        });

      case "rating":
        return hotelsToSort.sort((a, b) => {
          const ratingA = a.hangSao || 0;
          const ratingB = b.hangSao || 0;
          return sortOptions.sortOrder === "desc"
            ? ratingB - ratingA
            : ratingA - ratingB;
        });

      case "price_low":
        return hotelsToSort.sort((a, b) => {
          const priceA = a.giaThapNhat || 0;
          const priceB = b.giaThapNhat || 0;
          return priceA - priceB;
        });

      case "price_high":
        return hotelsToSort.sort((a, b) => {
          const priceA = a.giaThapNhat || 0;
          const priceB = b.giaThapNhat || 0;
          return priceB - priceA;
        });

      default:
        return hotelsToSort;
    }
  }, [filteredHotels, sortOptions]);

  const handleFilterApply = (newFilterOptions: FilterOptions) => {
    setFilterOptions(newFilterOptions);
    setFilterVisible(false);
  };

  const handleSortApply = (newSortOptions: SortOptions) => {
    setSortOptions(newSortOptions);
    setSortVisible(false);
  };
  const openSearchScreen = () => {
    router.push("/other/search");
  };

  const renderHotel = ({ item }: { item: KhachSanData }) => (
    <TouchableOpacity
      className="bg-white overflow-hidden"
      style={{
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
      }}
      onPress={() => router.push(`/hotels/${item.maKS}`)}
    >
      {/* Image + Tag */}
      <View className="relative">
        <Image
          source={{ uri: getImageUrl(item.anh) }}
          style={{ width: "100%", height: 160 }}
          resizeMode="cover"
        />
        {item.trangThai === "Nổi bật" && (
          <View
            className="bg-red-500"
            style={{
              position: "absolute",
              bottom: 8,
              left: 10,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 4,
              paddingVertical: 3,
              borderRadius: 5,
            }}
          >
            <Ionicons
              name="flame"
              size={14}
              color="#fff"
              style={{ marginRight: 4 }}
            />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Nổi bật
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg text-gray-800 flex-1" numberOfLines={1}>
            {item.tenKS}
          </Text>
          <View className="flex-row items-center ml-2">
            <Ionicons name="star" size={14} color="#FACC15" />
            <Text className="ml-1 text-sm text-gray-700">
              {item.hangSao || 0.0}
            </Text>
            <Text className="ml-1 text-xs text-gray-500">
              ({item.diemDanhGia || 0})
            </Text>
          </View>
        </View>

        <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
          📍 9.9km | {item.diaChi}
        </Text>

        {item.giaThapNhat && (
          <View className="mt-6">
            <Text className="text-xs text-gray-400">Chỉ từ</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-xl text-gray-800">
                {item.giaThapNhat.toLocaleString()}đ
              </Text>
              <Text className="text-sm text-gray-500 ml-1">/ 2 giờ</Text>
              <Text className="text-xl text-gray-400 mx-2"> • </Text>
              <Text className="text-xs" style={{ color: "#067FC4" }}>
                {(() => {
                  const availableRooms = getAvailableRoomsCount(item.maKS);
                  const totalRooms = getTotalRoomsCount(item.maKS);
                  const bookedRooms = getBookedRoomsCount(item.maKS);

                  // Debug log để kiểm tra dữ liệu
                  // console.log(`Hotel ${item.tenKS}:`, {
                  //   availableRooms,
                  //   totalRooms,
                  //   bookedRooms,
                  //   hotelId: item.maKS,
                  //   roomsInHotel: roomsData
                  //     .filter((room) => room.maKS === item.maKS)
                  //     .map((room) => ({
                  //       maPhong: room.maPhong,
                  //       trangThai: room.trangThai,
                  //       gia: room.gia,
                  //     })),
                  // });

                  if (totalRooms === 0) {
                    return "Chưa có phòng";
                  } else if (availableRooms === 0) {
                    return "Hết phòng";
                  } else {
                    return `${availableRooms}/${totalRooms} phòng trống`;
                  }
                })()}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ marginTop: 30 }}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          zIndex: 10,
        }}
      >
        {/* Header + Search */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderColor: "#E5E7EB",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* Nút Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="chevron-back" size={26} color="#374151" />
          </TouchableOpacity>

          {/* Ô tìm kiếm */}
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f3f4f6",
              borderRadius: 9999,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
            onPress={openSearchScreen}
          >
            <Ionicons name="search" size={18} color="#6b7280" />
            <Text style={{ marginLeft: 8, color: "#6b7280", fontSize: 16 }}>
              Tìm kiếm khách sạn...
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sort + Filter */}
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 12,
              borderRightWidth: 1,
              borderColor: "#E5E7EB",
            }}
            onPress={() => setSortVisible(true)}
          >
            <Ionicons name="swap-vertical" size={18} color="black" />
            <Text style={{ marginLeft: 6, fontSize: 14, fontWeight: "500" }}>
              Sắp xếp
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 12,
            }}
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons name="options-outline" size={18} color="black" />
            <Text style={{ marginLeft: 6, fontSize: 14, fontWeight: "500" }}>
              Bộ lọc
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Danh sách */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="cloud-download-outline" size={40} color="#9CA3AF" />
          <Text className="mt-2 text-gray-500">Đang tải khách sạn...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedHotels}
          keyExtractor={(item) => item.maKS.toString()}
          renderItem={renderHotel}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 130, paddingBottom: 80 }} // 🔥 sửa: để tránh bị che header + footer
        />
      )}
      {/* Nút Xem bản đồ */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 20,
          left: (SCREEN_WIDTH - 150) / 2, // ✅ căn giữa nút
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "black",
          padding: 14,
          borderRadius: 5,
          zIndex: 10,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          width: 150,
        }}
      >
        <Ionicons
          name="map-outline"
          size={22}
          color="#fff"
          style={{ marginRight: 10 }}
        />
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
          Xem bản đồ
        </Text>
      </TouchableOpacity>
      {/* Modal */}
      <SortModal
        visible={sortVisible}
        onClose={() => setSortVisible(false)}
        onApply={handleSortApply}
        currentSort={sortOptions}
      />
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleFilterApply}
        currentFilter={filterOptions}
      />
    </SafeAreaView>
  );
}
