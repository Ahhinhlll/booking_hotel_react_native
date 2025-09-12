import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  KhachSanServices,
  KhachSanData,
} from "../../services/KhachSanServices";
import { getImageUrl } from "../../utils/getImageUrl";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SuggestScreen() {
  const [hotels, setHotels] = useState<KhachSanData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const data = await KhachSanServices.getAll();
      setHotels(data);
    } catch (error) {
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const renderHotel = ({ item }: { item: KhachSanData }) => (
    <TouchableOpacity
      onPress={() => router.push(`/hotels/${item.maKS}`)}
      style={{
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 18,
        marginHorizontal: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        alignItems: "center",
        padding: 10,
      }}
    >
      {/* Hotel Image */}
      <Image
        source={{
          uri: item.anh
            ? Array.isArray(item.anh)
              ? getImageUrl(item.anh[0])
              : getImageUrl(item.anh)
            : "https://via.placeholder.com/120x90",
        }}
        style={{
          width: 100,
          height: 80,
          borderRadius: 10,
          marginRight: 12,
          backgroundColor: "#F3F4F6",
        }}
        resizeMode="cover"
      />
      {/* Info */}
      <View style={{ flex: 1, minHeight: 80, justifyContent: "center" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Ionicons name="star" size={16} color="#FCD34D" />
          <Text
            style={{
              marginLeft: 4,
              fontSize: 14,
              color: "#6B7280",
              fontWeight: "600",
            }}
          >
            {item.hangSao ? item.hangSao.toFixed(1) : "5.0"} (19)
          </Text>
          <View
            style={{
              backgroundColor: "#FFF6ED",
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
              marginLeft: 8,
            }}
          >
            <Text style={{ color: "#FB923C", fontSize: 12, fontWeight: "600" }}>
              Nổi bật
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "#1F2937",
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {item.tenKS}
        </Text>
        <Text
          style={{ fontSize: 13, color: "#6B7280", marginBottom: 2 }}
          numberOfLines={1}
        >
          {item.diaChi}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: "#1F2937", fontWeight: "bold" }}>
            {item.giaChiTu ? `${item.giaChiTu.toLocaleString()}đ` : "300.000đ"}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#FB923C",
              marginLeft: 8,
              fontWeight: "600",
            }}
          >
            Mã giảm 27K
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#FB923C" />
        </View>
      ) : (
        <FlatList
          data={hotels}
          keyExtractor={(item) => item.maKS}
          renderItem={renderHotel}
          contentContainerStyle={{ paddingBottom: 64, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 10,
                paddingBottom: 10,
                backgroundColor: "#fff",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: "#1F29377280",
                  fontWeight: "600",
                }}
              >
                Khám phá thêm
              </Text>
              <Text
                style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 10 }}
              >
                Những khách sạn lý tưởng không thể bỏ lỡ
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
