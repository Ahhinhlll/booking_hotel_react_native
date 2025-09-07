import { View, Text, Image } from "react-native";

export default function Header({ title }: { title: string }) {
  return (
    <View className="flex-row items-center p-4 bg-blue-500">
      <Image
        source={require("../assets/images/react-logo.png")}
        className="w-8 h-8 mr-2"
      />
      <Text className="text-white text-xl font-bold">{title}</Text>
    </View>
  );
}
