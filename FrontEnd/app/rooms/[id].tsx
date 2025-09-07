import { View, Text, Image, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { rooms } from "../../mockData";

export default function RoomDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const room = rooms.find((r) => r.id === id);

  if (!room) {
    return <Text className="p-4">Phòng không tồn tại</Text>;
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Image
          source={room.image}
          className="w-full rounded-xl mb-2"
          style={{ height: 200 }}
          resizeMode="cover"
        />

        <Text className="text-lg font-bold mb-2">Tên phòng: {room.name}</Text>
        <Text className="text-gray-500 mb-2">ID: {room.id}</Text>
        <Text className="text-gray-500 mb-2">Khách sạn: {room.hotelId}</Text>
        <Text className="text-gray-500 mb-2">
          Giá: {room.price.toLocaleString()} VND/đêm
        </Text>

        {/* Thêm nội dung demo dài hơn để thử scroll */}
        <Text className="text-gray-700 mt-4">
          Mô tả phòng: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Donec a metus ac leo efficitur placerat. Sed in felis at urna
          porttitor luctus. Pellentesque habitant morbi tristique senectus et
          netus et malesuada fames ac turpis egestas.
        </Text>
        <Text className="text-gray-700 mt-2">
          Tiện ích: Wifi, TV, Máy lạnh, Bồn tắm, Mini bar...
        </Text>
      </ScrollView>
    </View>
  );
}
