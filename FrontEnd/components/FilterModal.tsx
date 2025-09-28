import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function FilterModal({ visible, onClose }: any) {
  const [priceRange, setPriceRange] = useState([20000, 10000000]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [selectedClean, setSelectedClean] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const toggleSelect = (list: string[], setList: any, value: string) => {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const resetFilters = () => {
    setPriceRange([20000, 10000000]);
    setSelectedRatings([]);
    setSelectedClean([]);
    setSelectedTypes([]);
    setSelectedFacilities([]);
  };
  const tienNghi = [
    "Dịch vụ lưu trữ/bảo quản hành lý",
    "Thang máy",
    "Nhà hàng",
    "Két sắt",
    "Bãi đỗ xe ô tô",
    "Bể bơi",
    "Điều hoà",
    "Đưa đón sân bay",
    "Smart TV",
    "Ghế tình yêu",
    "Lễ tân 24/24",
    "Bồn tắm",
    "Dịch vụ dọn phòng",
    "Đồ dùng làm bếp",
    "Tủ lạnh",
    "Máy sấy tóc",
    "Tiện nghi là/ủi",
    "Quán cafe",
    "Khu vực có thể hút thuốc",
    "Wi-Fi miễn phí",
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            paddingHorizontal: 8,
            paddingTop: 20,
            paddingBottom: 10,
            height: SCREEN_HEIGHT * 0.95, // chiếm 95% màn hình
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Chọn lọc theo</Text>
            <TouchableOpacity onPress={resetFilters}>
              <Text className="text-orange-500 font-medium">Đặt lại</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            className="px-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 150 }}
          >
            {/* Khoảng giá */}
            <Text className="mt-4 mb-2 font-semibold text-gray-800">
              Khoảng giá
            </Text>
            <View className="mt-2 px-2" style={{ marginLeft: 25 }}>
              <MultiSlider
                values={priceRange}
                min={20000}
                max={10000000}
                step={10000}
                onValuesChange={(values) => setPriceRange(values)}
                selectedStyle={{ backgroundColor: "#f97316" }}
                markerStyle={{
                  height: 32,
                  width: 32,
                  borderRadius: 16,
                  backgroundColor: "#fff",
                  borderWidth: 2,
                  borderColor: "#f97316",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                customMarker={() => (
                  <View
                    style={{
                      height: 32,
                      width: 32,
                      borderRadius: 16,
                      backgroundColor: "#f97316",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="menu" size={16} color="#fff" />
                  </View>
                )}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <View style={{ width: 150, marginRight: 8 }}>
                {/* chỉnh độ rộng tại đây */}
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{ color: "#555", fontSize: 14, marginBottom: 4 }}
                  >
                    Giá tối thiểu
                  </Text>
                  {/* fontSize chỉnh label */}
                  <TextInput
                    keyboardType="numeric"
                    value={priceRange[0].toLocaleString("vi-VN") + " đ"}
                    onChangeText={(val) =>
                      setPriceRange([
                        Number(val.replace(/\D/g, "")),
                        priceRange[1],
                      ])
                    }
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: 18,
                      color: "#000",
                      paddingVertical: 4,
                    }} // fontSize chỉnh số
                  />
                </View>
              </View>

              <View style={{ width: 150 }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{ color: "#555", fontSize: 14, marginBottom: 4 }}
                  >
                    Giá tối đa
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={priceRange[1].toLocaleString("vi-VN") + " đ+"}
                    onChangeText={(val) =>
                      setPriceRange([
                        priceRange[0],
                        Number(val.replace(/\D/g, "")),
                      ])
                    }
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: 18,
                      color: "#000",
                      paddingVertical: 4,
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Điểm đánh giá */}
            <Text className="mt-6 mb-2 font-semibold text-gray-800">
              Điểm đánh giá
            </Text>
            <View className="flex-row flex-wrap">
              {[
                { label: "≥ 4.5", value: "4.5" },
                { label: "≥ 4.0", value: "4.0" },
                { label: "≥ 3.5", value: "3.5" },
              ].map((item, i) => {
                const active = selectedRatings.includes(item.value);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() =>
                      toggleSelect(
                        selectedRatings,
                        setSelectedRatings,
                        item.value
                      )
                    }
                    className={`flex-row items-center px-4 py-2 rounded-full mr-2 mb-2 ${
                      active ? "bg-orange-500" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={
                        active ? "text-white mr-1" : "text-gray-700 mr-1"
                      }
                    >
                      {item.label}
                    </Text>
                    <Ionicons
                      name="star"
                      size={16}
                      color={active ? "#fff" : "#f59e0b"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Điểm sạch sẽ */}
            <Text className="mt-6 mb-2 font-semibold text-gray-800">
              Điểm sạch sẽ
            </Text>
            <View className="flex-row flex-wrap">
              {[
                { label: "5.0", value: "5.0" },
                { label: "≥ 4.9", value: "4.9" },
                { label: "≥ 4.8", value: "4.8" },
              ].map((item, i) => {
                const active = selectedClean.includes(item.value);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() =>
                      toggleSelect(selectedClean, setSelectedClean, item.value)
                    }
                    className={`flex-row items-center px-4 py-2 rounded-full mr-2 mb-2 ${
                      active ? "bg-orange-500" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={
                        active ? "text-white mr-1" : "text-gray-700 mr-1"
                      }
                    >
                      {item.label}
                    </Text>
                    <Ionicons
                      name="star"
                      size={16}
                      color={active ? "#fff" : "#f59e0b"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Loại khách sạn */}
            <Text className="mt-6 mb-2 font-semibold text-gray-800">
              Loại khách sạn
            </Text>
            <View className="flex-row flex-wrap">
              {[
                "Flash Sale",
                "Giảm giá",
                "Ưu đãi",
                "Nổi bật",
                "Mới",
                "Tem",
                "Gọi điện đặt phòng",
              ].map((tag, i) => {
                const active = selectedTypes.includes(tag);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() =>
                      toggleSelect(selectedTypes, setSelectedTypes, tag)
                    }
                    className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                      active ? "bg-orange-500" : "bg-gray-100"
                    }`}
                  >
                    <Text className={active ? "text-white" : "text-gray-700"}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tiện ích */}
            <Text className="mt-6 mb-2 font-semibold text-gray-800">
              Tiện ích
            </Text>
            {tienNghi.map((item, i) => {
              const active = selectedFacilities.includes(item);
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() =>
                    toggleSelect(
                      selectedFacilities,
                      setSelectedFacilities,
                      item
                    )
                  }
                  className="flex-row items-center py-3 border-b border-gray-200"
                >
                  <Text className="flex-1 text-gray-700">{item}</Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: active ? "#f97316" : "#d1d5db",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: active ? "#f97316" : "transparent",
                    }}
                  >
                    {active && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Nút áp dụng */}
          <TouchableOpacity
            onPress={onClose}
            className="m-4 py-4 bg-orange-500 rounded-full"
          >
            <Text className="text-white text-center font-semibold text-base">
              Áp dụng
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
