import { View, Text } from "react-native";

export default function SuggestScreen() {
  return (
    <View className="flex-1 bg-white">
      <View className="p-4 bg-green-500">
        <Text className="text-white text-2xl font-bold">🚀 Đề xuất</Text>
      </View>
      <View className="flex-1 p-4">
        <Text>Danh sách phòng đề xuất sẽ hiển thị ở đây</Text>
      </View>
    </View>
  );
}
