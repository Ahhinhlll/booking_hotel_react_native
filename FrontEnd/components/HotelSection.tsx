import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { KhachSanServices, KhachSanData } from "../services/KhachSanServices";
import { getImageUrl } from "../utils/getImageUrl";

interface HotelSectionProps {
  title: string;
  subtitle?: string;
  searchQuery?: string;
  limit?: number;
}

export default function HotelSection({
  title,
  subtitle,
  searchQuery = "",
  limit = 10,
}: HotelSectionProps) {
  const [hotels, setHotels] = useState<KhachSanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadHotels();
  }, [searchQuery]);

  const loadHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      let data: KhachSanData[];

      if (searchQuery) {
        data = await KhachSanServices.search(searchQuery);
      } else {
        data = await KhachSanServices.getAll();
      }

      // Limit the number of hotels if specified
      if (limit && data.length > limit) {
        data = data.slice(0, limit);
      }

      setHotels(data);
    } catch (err) {
      console.error("Error loading hotels:", err);
      setError("Không thể tải danh sách khách sạn");
    } finally {
      setLoading(false);
    }
  };

  const handleHotelPress = (hotel: KhachSanData) => {
    router.push(`/hotels/${hotel.maKS}`);
  };

  const handleViewAll = () => {
    router.push("/hotels/all");
  };

  if (loading) {
    return (
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <View className="flex-row items-center">
              <Ionicons name="flash" size={20} color="#F97316" />
              <Text className="text-lg font-bold ml-1">{title}</Text>
            </View>
            {subtitle && (
              <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
            )}
          </View>
        </View>
        <View className="flex-row items-center justify-center py-8">
          <ActivityIndicator size="large" color="#F97316" />
          <Text className="ml-2 text-gray-500">Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <View className="flex-row items-center">
              <Ionicons name="flash" size={20} color="#F97316" />
              <Text className="text-lg font-bold ml-1">{title}</Text>
            </View>
            {subtitle && (
              <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
            )}
          </View>
        </View>
        <View className="flex-row items-center justify-center py-8">
          <Ionicons name="alert-circle" size={24} color="#EF4444" />
          <Text className="ml-2 text-red-500">{error}</Text>
        </View>
      </View>
    );
  }

  if (hotels.length === 0) {
    return (
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <View className="flex-row items-center">
              <Ionicons name="flash" size={20} color="#F97316" />
              <Text className="text-lg font-bold ml-1">{title}</Text>
            </View>
            {subtitle && (
              <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
            )}
          </View>
        </View>
        <View className="flex-row items-center justify-center py-8">
          <Ionicons name="home" size={24} color="#9CA3AF" />
          <Text className="ml-2 text-gray-500">Không có khách sạn nào</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 py-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <View className="flex-row items-center">
            <Ionicons name="flash" size={20} color="#F97316" />
            <Text className="text-lg font-bold ml-1">{title}</Text>
          </View>
          {subtitle && (
            <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
          )}
        </View>
        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleViewAll}
        >
          <Text className="text-sm text-gray-500">Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Hotels List */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {hotels.map((hotel) => (
          <TouchableOpacity
            key={hotel.maKS}
            className="mr-4 w-64"
            onPress={() => handleHotelPress(hotel)}
          >
            <View className="bg-white rounded-xl shadow-sm border border-gray-100">
              <View className="relative">
                <Image
                  source={{
                    uri: hotel.anh
                      ? getImageUrl(hotel.anh)
                      : "https://via.placeholder.com/300x160",
                  }}
                  className="w-full h-40 rounded-t-xl"
                  resizeMode="cover"
                />
                {hotel.trangThai === "Nổi bật" && (
                  <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded">
                    <Text className="text-white text-xs font-bold">
                      Nổi bật
                    </Text>
                  </View>
                )}
                {hotel.giaChiTu && hotel.giaChiTu < 500000 && (
                  <View className="absolute top-2 right-2 bg-orange-500 px-2 py-1 rounded">
                    <Text className="text-white text-xs font-bold">
                      Giá tốt
                    </Text>
                  </View>
                )}
              </View>

              <View className="p-3">
                <Text
                  className="font-semibold text-gray-800 mb-1"
                  numberOfLines={1}
                >
                  {hotel.tenKS}
                </Text>

                <View className="flex-row items-center mb-2">
                  {hotel.hangSao && (
                    <>
                      <Ionicons name="star" size={14} color="#FCD34D" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {hotel.hangSao}.0
                      </Text>
                      <Text className="text-sm text-gray-400 ml-1">•</Text>
                    </>
                  )}
                  <Text
                    className="text-sm text-gray-600 ml-1"
                    numberOfLines={1}
                  >
                    {hotel.tinhThanh || hotel.diaChi}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View>
                    {hotel.giaChiTu && (
                      <>
                        <Text className="text-xs text-gray-400">Chỉ từ</Text>
                        <Text className="text-sm font-bold text-gray-800">
                          {hotel.giaChiTu.toLocaleString()}đ
                          <Text className="font-normal"> / đêm</Text>
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
