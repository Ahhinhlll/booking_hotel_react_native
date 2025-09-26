import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useState, useEffect, useRef } from "react";
// @ts-ignore
import debounce from "lodash.debounce";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { KhachSanServices } from "../../services/KhachSanServices";
import { getImageUrl } from "../../utils/getImageUrl";

export default function SearchScreen() {
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<
    import("../../services/KhachSanServices").KhachSanData[]
  >([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [recentHotels, setRecentHotels] = useState<
    import("../../services/KhachSanServices").KhachSanData[]
  >([]);
  const [inputFocused, setInputFocused] = useState(false);
  const router = useRouter();

  // Debounce search
  const debouncedSearch = useRef(
    debounce(async (text: string) => {
      if (!text) {
        setSuggestions([]);
        setLoadingSuggest(false);
        return;
      }
      setLoadingSuggest(true);
      try {
        const res = await KhachSanServices.search({ q: text });
        setSuggestions(res);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setLoadingSuggest(false);
      }
    }, 300)
  ).current;

  // Fetch 6 most recent hotels
  const fetchRecentHotels = async () => {
    try {
      const res = await KhachSanServices.getRecentHotels();
      setRecentHotels(res);
    } catch {
      // Error fetching recent hotels
    }
  };

  useEffect(() => {
    debouncedSearch(location);
  }, [location, debouncedSearch]);

  useEffect(() => {
    fetchRecentHotels();
  }, []);

  // Gợi ý tìm kiếm khi nhập
  const renderSearchSuggestions = () => {
    if (!location) return null;

    return (
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {loadingSuggest && (
          <Text
            style={{ color: "#FB923C", textAlign: "center", marginTop: 20 }}
          >
            Đang tìm kiếm...
          </Text>
        )}
        {!loadingSuggest && suggestions.length > 0 && (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 14,
              marginTop: 4,
              maxHeight: 360,
              elevation: 2,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 8,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item.maKS}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F3F4F6",
                  }}
                  onPress={() => router.push(`/hotels/${item.maKS}`)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{
                      uri: getImageUrl(item.anh),
                    }}
                    style={{
                      width: 70,
                      height: 54,
                      borderRadius: 8,
                      marginRight: 12,
                      backgroundColor: "#F3F4F6",
                    }}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#1F2937",
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                      numberOfLines={1}
                    >
                      {item.tenKS}
                    </Text>
                    <Text
                      style={{ color: "#6B7280", fontSize: 13 }}
                      numberOfLines={1}
                    >
                      {item.diaChi}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        {!loadingSuggest && location && suggestions.length === 0 && (
          <Text
            style={{ color: "#9CA3AF", textAlign: "center", marginTop: 20 }}
          >
            Không tìm thấy khách sạn phù hợp.
          </Text>
        )}
      </View>
    );
  };
  // Giao diện gợi ý
  const renderRecentHotels = () => {
    if (location || recentHotels.length === 0) return null;

    return (
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      >
        {/* Gợi ý 6 khách sạn mới nhất */}
        <View style={{ marginBottom: 18, marginTop: 12 }}>
          <View
            style={{
              marginBottom: 12,
            }}
          >
            {" "}
            <Text className="text-black font-bold text-xl ">
              Gợi ý tìm kiếm
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {recentHotels.slice(0, 6).map((hotel) => (
              <TouchableOpacity
                key={hotel.maKS}
                style={{
                  width: "48%",
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  marginBottom: 16,
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  overflow: "hidden",
                }}
                onPress={() => router.push(`/hotels/${hotel.maKS}`)}
                activeOpacity={0.9}
              >
                <Image
                  source={{
                    uri: getImageUrl(hotel.anh),
                  }}
                  style={{
                    width: "100%",
                    height: 120,
                    backgroundColor: "#F3F4F6",
                  }}
                  resizeMode="cover"
                />
                <View style={{ padding: 12 }}>
                  <Text
                    style={{
                      color: "#1F2937",
                      fontWeight: "600",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                    numberOfLines={2}
                  >
                    {hotel.tinhThanh}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={{ alignSelf: "center", marginTop: 4 }}>
          <Text style={{ color: "#6C757D", fontSize: 14 }}>Xem thêm</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 50,
          paddingBottom: 16,
          backgroundColor: "#fff",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginRight: 12,
            padding: 4,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#FB923C" />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F8F9FA",
            borderRadius: 25,
            paddingHorizontal: 16,
            height: 48,
            borderWidth: 1,
            borderColor: "#E9ECEF",
          }}
        >
          <TextInput
            placeholder="Tìm địa điểm, khách sạn"
            style={{
              flex: 1,
              fontSize: 16,
              color: "#495057",
            }}
            value={location}
            onChangeText={setLocation}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            autoFocus={false}
          />
          <TouchableOpacity style={{ marginLeft: 8 }}>
            <Ionicons name="search" size={20} color="#6C757D" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "#FB923C",
            borderRadius: 25,
            padding: 12,
            marginLeft: 8,
          }}
          onPress={async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.7,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const imageUri = result.assets[0].uri;
              alert("Đã chọn ảnh: " + imageUri);
            }
          }}
        >
          <Ionicons name="camera-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {location.length > 0 ? renderSearchSuggestions() : renderRecentHotels()}
    </View>
  );
}
