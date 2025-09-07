import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PromoBanner() {
  return (
    <View className="px-4 py-2">
      <TouchableOpacity className="bg-gradient-to-r from-orange-400 to-yellow-400 rounded-xl p-4 relative overflow-hidden">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Text className="text-white text-lg font-bold">DEAL HOI</Text>
              <View className="bg-red-500 px-2 py-0.5 rounded ml-2">
                <Text className="text-white text-xs font-bold">%</Text>
              </View>
            </View>
            <Text className="text-white text-sm mb-1">Mỗi bạn mới</Text>
            <View className="bg-blue-500 px-3 py-1 rounded-full self-start">
              <Text className="text-white text-xs font-semibold">
                Lần đầu đặt phòng
              </Text>
            </View>
          </View>

          <View className="items-center">
            <Text className="text-white text-4xl font-bold">50</Text>
            <View className="flex-row items-center">
              <Text className="text-white text-lg">%</Text>
              <View className="bg-red-500 px-1 py-0.5 rounded ml-1">
                <Text className="text-white text-xs">%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Background decoration */}
        <View className="absolute -right-4 -top-4 opacity-20">
          <Ionicons name="home" size={80} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
