import { View, Text } from "react-native";

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-white">
      <View className="p-4 bg-purple-500">
        <Text className="text-white text-2xl font-bold">👤 Tài khoản</Text>
      </View>
      <View className="flex-1 p-4">
        <Text>Thông tin tài khoản sẽ hiển thị ở đây</Text>
      </View>
    </View>
  );
}
