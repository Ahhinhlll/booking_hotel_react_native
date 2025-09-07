import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Hotel {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  originalPrice?: number;
  currentPrice: number;
  duration: string;
  discount?: number;
  image: any;
  featured?: boolean;
}

interface HotelSectionProps {
  title: string;
  subtitle?: string;
  hotels: Hotel[];
}

export default function HotelSection({
  title,
  subtitle,
  hotels,
}: HotelSectionProps) {
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
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-sm text-gray-500">Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Hotels List */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {hotels.map((hotel) => (
          <TouchableOpacity key={hotel.id} className="mr-4 w-64">
            <View className="bg-white rounded-xl shadow-sm border border-gray-100">
              <View className="relative">
                <Image
                  source={hotel.image}
                  className="w-full h-40 rounded-t-xl"
                  resizeMode="cover"
                />
                {hotel.featured && (
                  <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded">
                    <Text className="text-white text-xs font-bold">
                      Nổi bật
                    </Text>
                  </View>
                )}
                {hotel.discount && (
                  <View className="absolute top-2 right-2 bg-orange-500 px-2 py-1 rounded">
                    <Text className="text-white text-xs font-bold">
                      Mã giảm {hotel.discount}K
                    </Text>
                  </View>
                )}
              </View>

              <View className="p-3">
                <Text
                  className="font-semibold text-gray-800 mb-1"
                  numberOfLines={1}
                >
                  {hotel.name}
                </Text>

                <View className="flex-row items-center mb-2">
                  <Ionicons name="star" size={14} color="#FCD34D" />
                  <Text className="text-sm text-gray-600 ml-1">
                    {hotel.rating} ({hotel.reviews})
                  </Text>
                  <Text className="text-sm text-gray-400 ml-1">•</Text>
                  <Text
                    className="text-sm text-gray-600 ml-1"
                    numberOfLines={1}
                  >
                    {hotel.location}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View>
                    {hotel.originalPrice && (
                      <Text className="text-xs text-gray-400 line-through">
                        Chỉ từ {hotel.originalPrice.toLocaleString()}đ
                      </Text>
                    )}
                    <Text className="text-sm font-bold text-gray-800">
                      {hotel.currentPrice.toLocaleString()}đ
                      <Text className="font-normal"> / {hotel.duration}</Text>
                    </Text>
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
