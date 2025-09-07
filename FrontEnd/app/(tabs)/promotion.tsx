import { View, Text } from "react-native";
import Header from "../../components/Header";

export default function PromotionsScreen() {
  return (
    <View className="flex-1">
      <Header title="Trang chủ" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg">Ưu đãi</Text>
      </View>
    </View>
  );
}
