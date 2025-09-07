import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { hotels, rooms } from "../../mockData";

export default function HotelDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const hotel = hotels.find((h) => h.id === id);
  const hotelRooms = rooms.filter((r) => r.hotelId === id);

  if (!hotel) return <Text className="p-4">Khách sạn không tồn tại</Text>;

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 bg-blue-500">
        <Text className="text-white text-2xl font-bold">{hotel.name}</Text>
      </View>

      <View className="flex-1 p-4">
        <Text className="text-lg font-semibold mb-2">Danh sách phòng:</Text>
        <FlatList
          data={hotelRooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="p-4 mb-3 bg-gray-100 rounded-lg"
              onPress={() =>
                router.push({
                  pathname: "/rooms/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Image
                source={item.image}
                className="w-full h-32 rounded-xl mb-2"
              />
              <Text className="text-lg font-bold">{item.name}</Text>
              <Text className="text-gray-500">Giá: {item.price} VND/đêm</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}
