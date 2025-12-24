import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchProvinces } from "../services/HeaderServices";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
        
        // Set default province if not already set
        if (!selectedProvince && data.length > 0) {
          setSelectedProvince(data[0].name);
        }
      } catch (error) {
        console.error("Error fetching provinces:", error);
        // fetchProvinces() đã có fallback data, không cần set empty array
        // setProvinces([]); // Removed this line
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
    router.push("/other/search");
  };

  // Collapsed header (chỉ có search và notification)
  if (isCollapsed) {
    return (
      <View
        style={{
          backgroundColor: "#FFFFFF",
          width: SCREEN_WIDTH,
          paddingHorizontal: 24,
          paddingVertical: 16,
          paddingTop: Platform.OS === "ios" ? 50 : 40,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            marginTop: 6,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "#F3F4F6",
              borderRadius: 25,
              paddingHorizontal: 24,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              marginRight: 16,
            }}
            onPress={openSearchScreen}
          >
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <Text
              style={{
                flex: 1,
                marginLeft: 8,
                color: "#6B7280",
                fontSize: 14,
              }}
            >
              Tên khách sạn, hoặc quận/huyện
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <View style={{ position: "relative" }}>
              <Ionicons name="notifications-outline" size={28} color="#333" />
              <View
                style={{
                  position: "absolute",
                  top: 3,
                  right: 4,
                  backgroundColor: "#EF4444",
                  width: 8,
                  height: 8,
                  borderRadius: 6,
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Full header (expanded)
  return (
    <View
      style={{
        backgroundColor: "#FB923C",
        width: SCREEN_WIDTH,
        paddingHorizontal: 24,
        paddingVertical: 16,
        paddingTop: Platform.OS === "ios" ? 50 : 40,
      }}
      className="py-5"
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          width: "100%",
        }}
      >
        {/* Bên trái */}
        <View style={{ flexDirection: "column" }}>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 14,
              marginBottom: 4,
              marginTop: 6,
            }}
          >
            Khám phá khách sạn và ưu đãi tại
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => setShowDropdown(true)}
          >
            <Ionicons name="location" size={18} color="#D95500" />
            <Text
              style={{
                color: "#FFFFFF",
                fontWeight: "600",
                marginLeft: 4,
                marginRight: 8,
              }}
            >
              {selectedProvince}
            </Text>
            <Ionicons name="chevron-down" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Chuông ở bên phải, căn giữa theo 2 dòng */}
        <TouchableOpacity>
          <View style={{ position: "relative" }}>
            <Ionicons name="notifications-outline" size={28} color="white" />
            <View
              style={{
                position: "absolute",
                top: 3,
                right: 4,
                backgroundColor: "#EF4444",
                width: 8,
                height: 8,
                borderRadius: 6,
              }}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <TouchableOpacity
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 25,
          paddingHorizontal: 24,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
        }}
        onPress={openSearchScreen}
      >
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <Text
          style={{
            flex: 1,
            marginLeft: 12,
            color: "#6B7280",
          }}
        >
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
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              maxHeight: 384,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                Chọn tỉnh thành
              </Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Loading indicator */}
            {loading ? (
              <View
                style={{
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color="#FB923C" />
                <Text
                  style={{
                    marginTop: 8,
                    color: "#6B7280",
                  }}
                >
                  Đang tải danh sách tỉnh thành...
                </Text>
              </View>
            ) : null}

            {/* Empty state */}
            {!loading && provinces.length === 0 ? (
              <View
                style={{
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  {"Không thể tải danh sách tỉnh thành.\nVui lòng kiểm tra kết nối internet."}
                </Text>
              </View>
            ) : null}

            {/* Provinces List */}
            {!loading ? (
              <FlatList
                data={provinces}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: "#F3F4F6",
                    }}
                    onPress={() => handleProvinceSelect(item)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color="#6B7280"
                      />
                      <Text
                        style={{
                          marginLeft: 12,
                          fontSize: 16,
                          color: "#1F2937",
                        }}
                      >
                        {item.name}
                      </Text>
                      {selectedProvince === item.name ? (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color="#FB923C"
                          style={{ marginLeft: "auto" }}
                        />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
