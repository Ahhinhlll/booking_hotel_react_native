import { Text, Image, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Hotel } from "../utils/types";

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <Link href={`/hotels/${hotel.id}`} asChild>
      <TouchableOpacity className="bg-white rounded-xl shadow p-3 mb-3">
        <Image source={hotel.image} className="w-full h-32 rounded-xl mb-2" />
        <Text className="font-bold text-lg">{hotel.name}</Text>
        <Text className="text-gray-500">{hotel.location}</Text>
      </TouchableOpacity>
    </Link>
  );
}
