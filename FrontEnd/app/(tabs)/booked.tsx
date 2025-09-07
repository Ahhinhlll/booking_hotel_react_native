import { View, Text } from "react-native";

export default function BookedScreen() {
  return (
    <View className="flex-1 bg-white">
      <View className="p-4 bg-yellow-500">
        <Text className="text-white text-2xl font-bold">✅ Phòng đã đặt</Text>
      </View>
      <View className="flex-1 p-4">
        <Text>Danh sách phòng đã đặt sẽ hiển thị ở đây</Text>
      </View>
    </View>
  );
}
