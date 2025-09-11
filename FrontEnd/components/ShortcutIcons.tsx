import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function ShortcutIcons() {
  const router = useRouter();

  const shortcuts = [
    {
      id: 1,
      imgs: require("../assets/images/shortIcon1.webp"),
      name: "Giảm 27K\nJoy Hết Ý",
      title: "shortIcon1",
      onPress: () => {
        router.push("/(tabs)/booked");
      },
    },
    {
      id: 2,
      imgs: require("../assets/images/shortIcon2.webp"),
      name: "Phòng Phim\nCouple",
      title: "shortIcon2",
      onPress: () => {
        router.push("/(tabs)/booked");
      },
    },
    {
      id: 3,
      imgs: require("../assets/images/shortIcon3.webp"),
      name: "Tình Yêu",
      title: "shortIcon3",
      onPress: () => {
        router.push("/(tabs)/booked");
      },
    },
    {
      id: 4,
      imgs: require("../assets/images/shortIcon4.webp"),
      name: "Góc Lãng\nMạn",
      title: "shortIcon4",
      onPress: () => {
        router.push("/(tabs)/booked");
      },
    },
    {
      id: 5,
      imgs: require("../assets/images/shortIcon5.webp"),
      name: "Giảm Giá\nBất ngờ",
      title: "shortIcon5",
      onPress: () => {
        router.push("/(tabs)/booked");
      },
    },
    {
      id: 6,
      imgs: require("../assets/images/shortIcon6.webp"),
      name: "Stay Xịn\nMới lên",
      title: "shortIcon6",
      onPress: () => {
        router.push("/(tabs)/booked");
      },
    },
    {
      id: 7,
      imgs: require("../assets/images/shortIcon7.webp"),
      name: "Top Review\nHotels",
      title: "shortIcon7",
      onPress: () => {
        router.push("/(tabs)/booked");
      },
    },
    {
      id: 8,
      imgs: require("../assets/images/shortIcon8.webp"),
      name: "Qua Đêm\ndưới 300K",
      title: "shortIcon8",
      onPress: () => {
        router.push("/(tabs)/booked");
      },
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
      onPress: () => {
        router.push("/(tabs)/booked");
      },
    },
    {
      id: 2,
      icon: "time",
      title: "Theo giờ",
      subtitle: "Xin từng phút giây",
      bgColor: "bg-orange-100",
      iconColor: "#F97316",
      onPress: () => {
        router.push("/(tabs)/booked");
      },
    },
    {
      id: 3,
      icon: "bed",
      title: "Qua đêm",
      subtitle: "Ngon giấc như ở nhà",
      bgColor: "bg-purple-100",
      iconColor: "#8B5CF6",
      onPress: () => {
        router.push("/(tabs)/booked");
      },
    },
    {
      id: 4,
      icon: "airplane",
      title: "Theo ngày",
      subtitle: "Mỗi ngày 1 niềm vui",
      bgColor: "bg-blue-100",
      iconColor: "#3B82F6",
      onPress: () => {
        router.push("/(tabs)/booked");
      },
    },
  ];

  return (
    <View className="bg-white px-4 py-8">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        {shortcuts.map((item) => (
          <TouchableOpacity
            key={item.id}
            // Tăng chiều rộng của card để tên không bị xuống dòng
            // và sử dụng padding thay vì margin-right để khoảng cách đều hơn
            className="items-center w-24 px-2 justify-start"
            onPress={item.onPress}
          >
            <Image
              source={item.imgs}
              style={styles.icon}
              resizeMode="contain"
            />
            {/* Sử dụng `leading-4` để điều chỉnh khoảng cách dòng, giúp text dễ đọc hơn */}
            <Text className="text-xs text-center text-gray-600 mt-2 leading-4">
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="flex-row flex-wrap">
        {quickOptions.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="w-1/2 p-1"
            onPress={item.onPress}
          >
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

const styles = StyleSheet.create({
  icon: {
    width: 50,
    height: 50,
  },
});
