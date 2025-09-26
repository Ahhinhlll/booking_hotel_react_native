import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import Toast from "react-native-toast-message";
import { AuthService } from "../../services/AuthServices";
import { NguoiDungServices } from "../../services/NguoiDungServices";
import ProfileHeader from "../../components/ProfileHeader";

interface UserData {
  maNguoiDung: string;
  hoTen: string;
  email: string;
  sdt: string;
  maVaiTro: string;
  trangThai: string;
  diaChi?: string;
  anhNguoiDung?: string | string[];
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const currentUser = await NguoiDungServices.getCurrentUser();
      if (currentUser) {
        setUserData(currentUser);
        // Get fresh data from server to ensure we have the latest info
        const freshData = await NguoiDungServices.getById(
          currentUser.maNguoiDung
        );
        if (freshData) {
          setUserData(freshData);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [fetchUser])
  );

  useEffect(() => {}, [userData]);

  const handleFavoriteHotels = () => {
    if (!userData) return;
    router.push("/(tabs)/booked");
  };

  const handleAccountSettings = () => {
    router.push("/(tabs)/profile");
  };

  const handleNotifications = () => {
    router.push("/(tabs)/profile");
  };

  const handleLanguage = () => {
    Toast.show({
      type: "info",
      text1: "Ngôn ngữ",
      text2: "Hiện tại đang sử dụng Tiếng Việt",
      position: "top",
    });
  };

  const handleRegion = () => {
    Toast.show({
      type: "info",
      text1: "Khu vực",
      text2: "Bạn đang ở Hưng Yên",
      position: "top",
    });
  };

  const handleFAQ = () => {
    router.push("/(tabs)/profile");
  };

  const handleTerms = () => {
    router.push("/(tabs)/profile");
  };

  const handleVersion = () => {
    Toast.show({
      type: "info",
      text1: "Phiên bản ứng dụng",
      text2: "Version 15.71.1 - Đã cập nhật mới nhất",
      position: "top",
    });
  };

  const handleContact = () => {
    router.push("/(tabs)/profile");
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const res = await AuthService.logout();
      if (res.success) {
        Toast.show({
          type: "success",
          text1: "Đăng xuất thành công!",
          text2: "Hẹn gặp lại bạn",
          position: "top",
          visibilityTime: 1000,
          onHide: () => {
            router.replace("/auth/login");
          },
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi đăng xuất",
        text2: "Vui lòng thử lại",
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      {/* Sửa lại để ProfileHeader có màu nền khớp với ảnh */}
      <ProfileHeader 
        userData={userData} 
        key={Array.isArray(userData?.anhNguoiDung) 
          ? userData?.anhNguoiDung[0] || 'no-image'
          : userData?.anhNguoiDung || 'no-image'
        }
      />
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Section: Trang của tôi */}
        <View className="mt-6 px-4" style={{ marginTop: 18 }}>
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Trang của tôi
          </Text>
          <View className="bg-white rounded-lg shadow-sm">
            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={handleFavoriteHotels}
            >
              <Ionicons
                name="heart-outline"
                size={24}
                color="#6B7280"
                style={{ marginRight: 16 }}
              />
              <Text className="flex-1 text-base text-gray-800">
                Khách sạn yêu thích
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Cài đặt */}
        <View className="mt-6 px-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Cài đặt</Text>
          <View className="bg-white rounded-lg shadow-sm">
            <TouchableOpacity
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={handleAccountSettings}
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color="#6B7280"
                style={{ marginRight: 16 }}
              />
              <Text className="flex-1 text-base text-gray-800">
                Thiết lập tài khoản
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={handleNotifications}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#6B7280"
                style={{ marginRight: 16 }}
              />
              <Text className="flex-1 text-base text-gray-800">Thông báo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={handleLanguage}
            >
              <Ionicons
                name="language-outline"
                size={24}
                color="#6B7280"
                style={{ marginRight: 16 }}
              />
              <Text className="flex-1 text-base text-gray-800">Ngôn ngữ</Text>
              <Text
                className="text-sm mr-2 font-semibold"
                style={{ color: "#fb8537" }}
              >
                Tiếng Việt
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={handleRegion}
            >
              <Ionicons
                name="location-outline"
                size={24}
                color="#6B7280"
                style={{ marginRight: 16 }}
              />
              <Text className="flex-1 text-base text-gray-800">Khu vực</Text>
              <Text
                className="text-sm mr-2 font-semibold"
                style={{ color: "#fb8537" }}
              >
                Hưng Yên
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Thông tin */}
        <View className="mt-6 px-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Thông tin
          </Text>
          <View className="bg-white rounded-lg shadow-sm">
            <TouchableOpacity
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={handleFAQ}
            >
              <Ionicons
                name="help-circle-outline"
                size={24}
                color="#6B7280"
                style={{ marginRight: 16 }}
              />
              <Text className="flex-1 text-base text-gray-800">Hỏi đáp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={handleTerms}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color="#6B7280"
                style={{ marginRight: 16 }}
              />
              <Text className="flex-1 text-base text-gray-800">
                Điều khoản & Chính sách bảo mật
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={handleVersion}
            >
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#6B7280"
                style={{ marginRight: 16 }}
              />
              <Text className="flex-1 text-base text-gray-800">Phiên bản</Text>
              <Text className="text-gray-500 text-sm mr-2">15.71.1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={handleContact}
            >
              <Ionicons
                name="call-outline"
                size={24}
                color="#6B7280"
                style={{ marginRight: 16 }}
              />
              <Text className="flex-1 text-base text-gray-800">Liên hệ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Đăng xuất */}
        <View className="mt-6 px-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Đăng xuất
          </Text>
          <View className="bg-white rounded-lg shadow-sm">
            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color="#EF4444"
                style={{ marginRight: 16 }}
              />
              <Text className="flex-1 text-base font-semibold text-red-500">
                Đăng xuất
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
