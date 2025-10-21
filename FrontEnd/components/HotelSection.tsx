import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KhachSanData, KhachSanServices } from "../services/KhachSanServices";
import { getImageUrl } from "../utils/getImageUrl";

interface HotelSectionProps {
  title: string;
  subtitle?: string;
  searchQuery?: string;
  limit?: number;
  backgroundImage?: any;
  titleColor?: string; // màu tiêu đề
  onExpired?: () => void; // hàm gọi khi hết giờ Flash Sale
}

export default function HotelSection(props: HotelSectionProps) {
  // Countdown timer for Flash Sale
  const COUNTDOWN_SECONDS = 2 * 60 * 60; // 2 * 60 * 60 = 2 hours
  const [timer, setTimer] = useState(COUNTDOWN_SECONDS);
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(true);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (props.title === "Flash Sale") {
      // Start countdown
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsFlashSaleActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [props.title]);

  // Báo cho HomeScreen khi Flash Sale hết hạn
  useEffect(() => {
    if (!isFlashSaleActive && props.onExpired) {
      props.onExpired();
    }
  }, [isFlashSaleActive, props.onExpired]);

  // Format timer to HH:mm:ss
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
  const {
    title,
    subtitle,
    searchQuery = "",
    limit = 10,
    backgroundImage,
    titleColor,
  } = props;
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
        data = await KhachSanServices.search({ q: searchQuery });
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
    router.push("/hotels/HotelListScreen");
  };

  // Helper to render section content
  const renderSectionContent = () => (
    <>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <View className="flex-row items-center">
            <Ionicons name="flash" size={20} color="#F97316" />
            <Text
              className="text-lg font-bold ml-1"
              style={{ color: titleColor || "#000" }}
            >
              {title}
            </Text>
            {/* Countdown timer for Flash Sale */}
            {title === "Flash Sale" && isFlashSaleActive && (
              <View className="ml-2 flex-row items-center">
                {/* Giờ */}
                <View className="px-1 py-1 bg-orange-500/70 rounded">
                  <Text className="text-xs text-white font-bold">
                    {String(Math.floor(timer / 3600)).padStart(2, "0")}
                  </Text>
                </View>

                {/* Dấu : */}
                <Text className="mx-1 text-xs font-bold text-orange-600">
                  :
                </Text>

                {/* Phút */}
                <View className="px-1 py-1 bg-orange-500/70 rounded">
                  <Text className="text-xs text-white font-bold">
                    {String(Math.floor((timer % 3600) / 60)).padStart(2, "0")}
                  </Text>
                </View>

                {/* Dấu : */}
                <Text className="mx-1 text-xs font-bold text-orange-600">
                  :
                </Text>

                {/* Giây */}
                <View className="px-1 py-1 bg-orange-500/70 rounded">
                  <Text className="text-xs text-white font-bold">
                    {String(timer % 60).padStart(2, "0")}
                  </Text>
                </View>
              </View>
            )}
          </View>
          {title === "Flash Sale" && !isFlashSaleActive ? null : (
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

      {/* Hotels card */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {hotels.map((hotel) => (
          <TouchableOpacity
            key={hotel.maKS}
            className="mr-4 w-64"
            onPress={() => handleHotelPress(hotel)}
          >
            <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Hình ảnh khách sạn */}
              <View className="relative">
                <Image
                  source={{ uri: getImageUrl(hotel.anh) }}
                  className="w-full h-40"
                  resizeMode="cover"
                />

                {/* Badge Nổi bật */}
                {hotel.noiBat === "Nổi bật" && (
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
                    <Text
                      style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}
                    >
                      {hotel.noiBat}
                    </Text>
                  </View>
                )}
              </View>

              {/* Nội dung thông tin */}
              <View className="p-3">
                {/* Tên khách sạn */}
                <Text
                  className="font-semibold text-gray-800 mb-1"
                  numberOfLines={1}
                >
                  {hotel.tenKS}
                </Text>

                {/* Đánh giá + địa điểm */}
                <View className="flex-row items-center mb-6">
                  <Ionicons name="star" size={14} color="#FCD34D" />
                  <Text className="text-sm font-semibold text-gray-800 ml-1">
                    {`${hotel.hangSao}.0`}
                  </Text>
                  <Text className="text-sm text-gray-600 ml-1">
                    {`(${hotel.diemDanhGia})`}
                  </Text>
                  <Text className="text-xl text-gray-500 mx-1">•</Text>
                  <Text className="text-sm text-gray-600" numberOfLines={1}>
                    {hotel.tinhThanh}
                  </Text>
                </View>

                {/* Giá */}
                <View>
                  {hotel.giaThapNhat && (
                    <>
                      <Text className="text-xs text-gray-400">Chỉ từ</Text>
                      <Text className="text-base font-bold text-gray-800">
                        {hotel.giaThapNhat.toLocaleString()}đ
                        <Text className="font-normal text-gray-500">
                          / 2 giờ
                        </Text>
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

  if (loading) {
    // Loading UI
    const loadingContent = (
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
    if (title === "Flash Sale" && backgroundImage) {
      return (
        <ImageBackground
          source={backgroundImage}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderRadius: 16,
            marginHorizontal: 0,
            marginVertical: 0,
          }}
          imageStyle={{ borderRadius: 16 }}
        >
          {loadingContent}
        </ImageBackground>
      );
    }
    return loadingContent;
  }

  if (error) {
    const errorContent = (
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
    if (title === "Flash Sale" && backgroundImage) {
      return (
        <ImageBackground
          source={backgroundImage}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderRadius: 16,
            marginHorizontal: 0,
            marginVertical: 0,
          }}
          imageStyle={{ borderRadius: 16 }}
        >
          {errorContent}
        </ImageBackground>
      );
    }
    return errorContent;
  }
  if (hotels.length === 0) {
    const emptyContent = (
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
    if (title === "Flash Sale" && backgroundImage) {
      return (
        <ImageBackground
          source={backgroundImage}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderRadius: 16,
            marginHorizontal: 0,
            marginVertical: 0,
          }}
          imageStyle={{ borderRadius: 16 }}
        >
          {emptyContent}
        </ImageBackground>
      );
    }
    return emptyContent;
  }

  // Main render: Only wrap with ImageBackground for Flash Sale
  if (title === "Flash Sale" && backgroundImage) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderRadius: 16,
          marginHorizontal: 0,
          marginVertical: 0,
        }}
        imageStyle={{ borderRadius: 16 }}
      >
        {renderSectionContent()}
      </ImageBackground>
    );
  }
  return <View className="px-4 py-4">{renderSectionContent()}</View>;
}
