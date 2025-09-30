import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { getImageUrl } from "../../utils/getImageUrl";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HotelListScreen() {
  const router = useRouter();
  const [hotels, setHotels] = useState<KhachSanData[]>([]);
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotels();
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
              {item.hangSao || 4.9}
            </Text>
            <Text className="ml-1 text-xs text-gray-500">
              ({item.diemDanhGia || 8})
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
                Chỉ còn 1 phòng
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
          data={hotels}
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
      <SortModal visible={sortVisible} onClose={() => setSortVisible(false)} />
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </SafeAreaView>
  );
}
