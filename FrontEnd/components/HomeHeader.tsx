import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { fetchProvinces } from "../services/HeaderServices";

type Province = {
  code: string;
  name: string;
};

interface HomeHeaderProps {
  isCollapsed?: boolean;
}

export default function HomeHeader({ isCollapsed = false }: HomeHeaderProps) {
  const [selectedProvince, setSelectedProvince] = useState("Hưng Yên");
  const [showDropdown, setShowDropdown] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Set status bar light for better visibility
  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor("transparent");
      StatusBar.setTranslucent(true);
    }
  }, []);

  // Fetch provinces from API
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoading(true);
        const data = await fetchProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        setProvinces([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadProvinces();
  }, []);

  const handleProvinceSelect = (province: Province) => {
    setSelectedProvince(province.name);
    setShowDropdown(false);
  };

  const openSearchScreen = () => {
    router.push("/search/search");
  };

  // Collapsed header (chỉ có search và notification)
  if (isCollapsed) {
    return (
      <View className="bg-white px-6 py-4 pt-12 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="flex-1 bg-gray-100 rounded-full px-6 py-2 flex-row items-center mr-4"
            onPress={openSearchScreen}
          >
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <Text className="flex-1 ml-2 text-gray-500 text-sm">
              Tên khách sạn, hoặc quận/huyện
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <View className="relative">
              <Ionicons name="notifications-outline" size={24} color="#333" />
              <View className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Full header (expanded)
  return (
    <View className="bg-orange-400 px-6 py-4 pt-12">
      {!isCollapsed && (
        <>
          {/* Top section with location and notification */}
          <View className="flex-row items-start justify-between mb-4">
            <View>
              <Text className="text-white text-sm px-1">
                Khám phá khách sạn và ưu đãi tại
              </Text>
              <TouchableOpacity
                className="flex-row items-center mt-1"
                onPress={() => setShowDropdown(true)}
              >
                <Ionicons name="location" size={18} color="#FF6B35" />
                <Text className="text-white font-semibold ml-1 mr-2">
                  {selectedProvince}
                </Text>
                <Ionicons name="chevron-down" size={16} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity>
              <View className="relative">
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="white"
                />
                <View className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full" />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Search bar */}
      <TouchableOpacity
        className="bg-white rounded-full px-6 py-3 flex-row items-center"
        onPress={openSearchScreen}
      >
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <Text className="flex-1 ml-3 text-gray-500">
          Tên khách sạn, hoặc quận/huyện
        </Text>
      </TouchableOpacity>

      {/* Province Selection Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDropdown(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-xl max-h-96">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">Chọn tỉnh thành</Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Loading indicator */}
            {loading && (
              <View className="p-4 items-center">
                <ActivityIndicator size="large" color="#FB923C" />
                <Text className="mt-2 text-gray-500">
                  Đang tải danh sách tỉnh thành...
                </Text>
              </View>
            )}

            {/* Provinces List */}
            {!loading && (
              <FlatList
                data={provinces}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="p-4 border-b border-gray-100"
                    onPress={() => handleProvinceSelect(item)}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color="#6B7280"
                      />
                      <Text className="ml-3 text-base text-gray-800">
                        {item.name}
                      </Text>
                      {selectedProvince === item.name && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color="#FB923C"
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
