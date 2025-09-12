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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
// import { KhachSanServices, KhachSanData } from "../../services/KhachSanServices";
import { PhongServices, PhongData } from "../../services/PhongServices";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RoomListScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  // const [hotel, setHotel] = useState<KhachSanData | null>(null); // Không dùng
  const [rooms, setRooms] = useState<PhongData[]>([]);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "flashsale"

  useEffect(() => {
    loadHotelAndRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadHotelAndRooms = async () => {
    try {
      const roomList = await PhongServices.getByKhachSan(id as string);
      setRooms(roomList);
    } catch (error) {
      console.error("Error loading rooms info:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin phòng");
      router.back();
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleBookRoom = (room: PhongData) => {
    Alert.alert("Đặt phòng", `Bạn có muốn đặt ${room.tenPhong}?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đặt phòng",
        onPress: () => {
          // TODO: Implement booking functionality
          Alert.alert("Thành công", "Đặt phòng thành công!");
        },
      },
    ]);
  };

  // Nếu có trường flashSale thì lọc, còn không thì hiển thị tất cả
  const filteredRooms =
    activeTab === "flashsale"
      ? rooms.filter((room: any) => room.flashSale)
      : rooms;

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

      {/* Date Selection Bar */}
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
              marginBottom: 8,
            }}
          >
            <Ionicons name="time" size={20} color="#6B7280" />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 16,
                fontWeight: "600",
                color: "#1F2937",
              }}
            >
              Qua đêm | 01 đêm
            </Text>
            <TouchableOpacity style={{ marginLeft: "auto" }}>
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
                22:00, 12/09
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#6B7280" />
            <View>
              <Text style={{ fontSize: 12, color: "#6B7280" }}>Trả phòng</Text>
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}
              >
                09:00, 13/09
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
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: activeTab === "all" ? "#FEF3E7" : "transparent",
            marginRight: 12,
          }}
        >
          <Text
            style={{
              color: activeTab === "all" ? "#FB923C" : "#6B7280",
              fontWeight: activeTab === "all" ? "600" : "normal",
            }}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("flashsale")}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor:
              activeTab === "flashsale" ? "#FEF3E7" : "transparent",
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
        {filteredRooms.map((room) => (
          <View
            key={room.maPhong}
            style={{
              backgroundColor: "#FFFFFF",
              marginHorizontal: 16,
              marginTop: 16,
              borderRadius: 12,
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            {/* Room Image */}
            <View style={{ position: "relative" }}>
              <Image
                source={{
                  uri: Array.isArray(room.anh)
                    ? room.anh[0]
                    : room.anh || "https://via.placeholder.com/300x200",
                }}
                style={{
                  width: SCREEN_WIDTH - 32,
                  height: 200,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                }}
                resizeMode="cover"
              />
            </View>

            {/* Room Info */}
            <View style={{ padding: 16 }}>
              {/* Room Title */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1F2937",
                  marginBottom: 8,
                }}
              >
                {room.tenPhong}
              </Text>

              {/* Room Details */}
              <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>
                {room.dienTich} • {room.thongTin}
              </Text>
              <Text
                style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}
              >
                {room.moTa}
              </Text>

              {/* Price Section */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  {/* Giá phòng nếu có */}
                  {/* Có thể lấy từ room.GiaPhongs nếu backend trả về */}
                </View>

                {/* Book Button */}
                <TouchableOpacity
                  onPress={() => handleBookRoom(room)}
                  style={{
                    backgroundColor: "#FB923C",
                    borderRadius: 20,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
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
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
