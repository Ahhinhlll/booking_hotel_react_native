import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ShortcutIcons() {
  const shortcuts = [
    {
      id: 1,
      icon: "pricetag",
      label: "Deal Tô Đón\nLẻ 2.9",
      bgColor: "bg-orange-100",
      iconColor: "#FF6B35",
      hasHotBadge: true,
    },
    {
      id: 2,
      icon: "desktop",
      label: "Phòng Phim\nTình Yêu",
      bgColor: "bg-orange-100",
      iconColor: "#FF6B35",
      hasHotBadge: true,
    },
    {
      id: 3,
      icon: "heart",
      label: "Tình yêu",
      bgColor: "bg-gray-100",
      iconColor: "#6B7280",
      hasHotBadge: false,
    },
    {
      id: 4,
      icon: "wine",
      label: "Góc Lãng\nMạn",
      bgColor: "bg-gray-100",
      iconColor: "#6B7280",
      hasHotBadge: false,
    },
    {
      id: 5,
      icon: "cash",
      label: "Giảm Giá Lênh\nNgó",
      bgColor: "bg-gray-100",
      iconColor: "#6B7280",
      hasHotBadge: false,
    },
  ];

  const quickOptions = [
    {
      id: 1,
      icon: "location",
      title: "Gần bạn",
      subtitle: "Một bước lên máy",
      bgColor: "bg-green-100",
      iconColor: "#10B981",
    },
    {
      id: 2,
      icon: "time",
      title: "Theo giờ",
      subtitle: "Xin từng phút giây",
      bgColor: "bg-orange-100",
      iconColor: "#F97316",
    },
    {
      id: 3,
      icon: "bed",
      title: "Qua đêm",
      subtitle: "Ngon giấc như ở nhà",
      bgColor: "bg-purple-100",
      iconColor: "#8B5CF6",
    },
    {
      id: 4,
      icon: "airplane",
      title: "Theo ngày",
      subtitle: "Mỗi ngày 1 niềm vui",
      bgColor: "bg-blue-100",
      iconColor: "#3B82F6",
    },
  ];

  return (
    <View className="bg-white px-4 py-4">
      {/* Top shortcuts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        {shortcuts.map((item) => (
          <TouchableOpacity key={item.id} className="items-center mr-4 w-16">
            <View
              className={`relative ${item.bgColor} w-12 h-12 rounded-xl items-center justify-center`}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={item.iconColor}
              />
              {item.hasHotBadge && (
                <View className="absolute -top-1 -right-1 bg-red-500 px-1 py-0.5 rounded">
                  <Text className="text-white text-xs font-bold">HOT</Text>
                </View>
              )}
            </View>
            <Text className="text-xs text-center mt-1 text-gray-600 leading-3">
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick options grid */}
      <View className="flex-row flex-wrap">
        {quickOptions.map((item) => (
          <TouchableOpacity key={item.id} className="w-1/2 p-1">
            <View
              className={`${item.bgColor} rounded-xl p-4 flex-row items-center`}
            >
              <View
                className={`w-10 h-10 rounded-lg items-center justify-center mr-3`}
                style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={item.iconColor}
                />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">
                  {item.title}
                </Text>
                <Text className="text-xs text-gray-600 mt-0.5">
                  {item.subtitle}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
