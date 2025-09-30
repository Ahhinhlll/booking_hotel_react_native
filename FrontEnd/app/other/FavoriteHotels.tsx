import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { KhachSanData } from "../../services/KhachSanServices";
import { getImageUrl } from "../../utils/getImageUrl";
import { useIsFocused } from "@react-navigation/native";

export default function FavoriteHotels() {
  const [favorites, setFavorites] = useState<KhachSanData[]>([]);
  const router = useRouter();
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const data = await AsyncStorage.getItem("yeuThich");
        setFavorites(data ? JSON.parse(data) : []);
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };

    if (isFocused) {
      loadFavorites();
    }
  }, [isFocused]);

  const renderHotel = ({ item }: { item: KhachSanData }) => (
    <TouchableOpacity
      onPress={() => router.push(`/hotels/${item.maKS}`)}
      style={{
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 16,
        overflow: "hidden",
        elevation: 2,
      }}
    >
      {/* Hình ảnh */}
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: getImageUrl(item.anh) }}
          style={{ width: 148, height: 151 }}
          resizeMode="cover"
        />
        <Ionicons
          name="heart"
          size={20}
          color="tomato"
          style={{ position: "absolute", top: 8, right: 8 }}
        />
      </View>

      {/* Nội dung */}
      <View style={{ flex: 1, padding: 12, justifyContent: "space-between" }}>
        {/* Đánh giá + Nổi bật */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="star" size={14} color="#FACC15" />
            <Text style={{ marginLeft: 4, fontSize: 13, color: "#555" }}>
              {item.hangSao}.0 ({item.diemDanhGia})
            </Text>
          </View>

          {item.trangThai === "Nổi bật" && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#EF4444",
                paddingHorizontal: 5,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Ionicons
                name="flame"
                size={12}
                color="#fff"
                style={{ marginRight: 3 }}
              />
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "500" }}>
                Nổi bật
              </Text>
            </View>
          )}
        </View>

        {/* Tên KS */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "400",
            color: "#111",
            marginTop: 4,
          }}
          numberOfLines={2}
        >
          {item.tenKS}
        </Text>

        {/* Giá */}
        <View style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 13, color: "#9CA3AF" }}>Chỉ từ</Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111",
            }}
          >
            {item.giaThapNhat?.toLocaleString()}đ
          </Text>
          <Text style={{ fontSize: 12, color: "#F97316", marginTop: 2 }}>
            Mã giảm 27K
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header cố định */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingVertical: 16,
          borderBottomWidth: 0.5,
          borderBottomColor: "#E5E7EB",
          backgroundColor: "#fff",
          marginTop: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color="#374151" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
          Khách sạn yêu thích
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Danh sách cuộn */}
      {favorites.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="heart-outline" size={48} color="#9CA3AF" />
          <Text style={{ marginTop: 8, fontSize: 16, color: "#6B7280" }}>
            Bạn chưa có khách sạn yêu thích
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={favorites}
          keyExtractor={(item) => item.maKS.toString()}
          renderItem={renderHotel}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
