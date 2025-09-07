import { View, Text, Image } from "react-native";
import { Room } from "../utils/types";

export default function RoomCard({ room }: { room: Room }) {
  return (
    <View className="bg-white rounded-xl shadow p-3 mb-3">
      <Image source={room.image} className="w-full h-32 rounded-xl mb-2" />
      <Text className="font-bold text-lg">{room.name}</Text>
      <Text className="text-gray-500">Giá: {room.price} VND/đêm</Text>
    </View>
  );
}
