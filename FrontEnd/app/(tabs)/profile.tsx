import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await NguoiDungServices.getCurrentUser();
      if (currentUser) {
        setUserData(currentUser);
        const freshData = await NguoiDungServices.getById(
          currentUser.maNguoiDung
        );
        setUserData(freshData);
      }
    };
    fetchUser();
  }, []);

  const handleFavoriteHotels = async () => {
    if (!userData) return;

    router.push("..");
  };

  const handleAccountSettings = () => {
    router.push("..");
  };

  const handleNotifications = () => {
    router.push("..");
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
    router.push("..");
  };

  const handleTerms = () => {
    router.push("..");
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
    router.push("..");
  };

  // ProfileScreen.tsx
  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const res = await AuthService.logout();
      if (res.success) {
        Toast.show({
          type: "success",
          text1: "Đăng xuất thành công!",
          text2: "Hẹn gặp lại bạn 👋",
          position: "top",
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

  const showLogoutConfirm = () => {
    Toast.show({
      type: "info",
      text1: "Bạn có chắc chắn muốn đăng xuất?",
      text2: "Nhấn vào thông báo này để xác nhận",
      position: "bottom",
      visibilityTime: 4000,
      bottomOffset: 100,
      onPress: performLogout,
    });
  };

  const performLogout = async () => {
    setIsLoading(true);

    try {
      Toast.show({
        type: "info",
        text1: "Đang đăng xuất...",
        text2: "Vui lòng đợi trong giây lát",
        position: "top",
        visibilityTime: 1000,
      });

      await AuthService.logout();

      Toast.show({
        type: "success",
        text1: "Đăng xuất thành công!",
        text2: "Hẹn gặp lại bạn",
        position: "top",
        onHide: () => {
          router.replace("/auth/login");
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi đăng xuất",
        text2: "Đã xảy ra lỗi khi đăng xuất",
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FEF3E7]">
      {/* Custom Header */}
      <ProfileHeader userData={userData} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Section: Trang của tôi */}
        <View className="mt-4">
          <Text className="text-lg font-bold text-gray-800 px-5 mb-3">
            Trang của tôi
          </Text>

          <TouchableOpacity
            className="bg-white flex-row items-center px-5 py-4"
            onPress={handleFavoriteHotels}
          >
            <Ionicons name="heart-outline" size={24} color="#6B7280" />
            <Text className="flex-1 text-base text-gray-800 ml-4">
              Khách sạn yêu thích
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Section: Cài đặt */}
        <View className="mt-6">
          <Text className="text-lg font-bold text-gray-800 px-5 mb-3">
            Cài đặt
          </Text>

          <View className="bg-white">
            <TouchableOpacity
              className="flex-row items-center px-5 py-4 border-b border-gray-100"
              onPress={handleAccountSettings}
            >
              <Ionicons name="settings-outline" size={24} color="#6B7280" />
              <Text className="flex-1 text-base text-gray-800 ml-4">
                Thiết lập tài khoản
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-5 py-4 border-b border-gray-100"
              onPress={handleNotifications}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#6B7280"
              />
              <Text className="flex-1 text-base text-gray-800 ml-4">
                Thông báo
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-5 py-4 border-b border-gray-100"
              onPress={handleLanguage}
            >
              <Ionicons name="language-outline" size={24} color="#6B7280" />
              <Text className="flex-1 text-base text-gray-800 ml-4">
                Ngôn ngữ
              </Text>
              <Text className="text-orange-500 text-sm mr-2">Tiếng Việt</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-5 py-4"
              onPress={handleRegion}
            >
              <Ionicons name="location-outline" size={24} color="#6B7280" />
              <Text className="flex-1 text-base text-gray-800 ml-4">
                Khu vực
              </Text>
              <Text className="text-orange-500 text-sm mr-2">Hưng Yên</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Thông tin */}
        <View className="mt-6">
          <Text className="text-lg font-bold text-gray-800 px-5 mb-3">
            Thông tin
          </Text>

          <View className="bg-white">
            <TouchableOpacity
              className="flex-row items-center px-5 py-4 border-b border-gray-100"
              onPress={handleFAQ}
            >
              <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
              <Text className="flex-1 text-base text-gray-800 ml-4">
                Hỏi đáp
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-5 py-4 border-b border-gray-100"
              onPress={handleTerms}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color="#6B7280"
              />
              <Text className="flex-1 text-base text-gray-800 ml-4">
                Điều khoản & Chính sách bảo mật
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-5 py-4 border-b border-gray-100"
              onPress={handleVersion}
            >
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#6B7280"
              />
              <Text className="flex-1 text-base text-gray-800 ml-4">
                Phiên bản
              </Text>
              <Text className="text-gray-500 text-sm mr-2">15.71.1</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-5 py-4"
              onPress={handleContact}
            >
              <Ionicons name="call-outline" size={24} color="#6B7280" />
              <Text className="flex-1 text-base text-gray-800 ml-4">
                Liên hệ
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-white mx-5 mt-6 mb-4 flex-row items-center justify-center py-4 rounded-lg"
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className="text-base font-semibold text-red-500 ml-2">
            {isLoading ? "Đang đăng xuất..." : "Đăng xuất"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
