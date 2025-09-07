import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { hotels } from "../../mockData";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 bg-blue-500">
        <Text className="text-white text-2xl font-bold">
          🏨 Danh sách khách sạn
        </Text>
      </View>

      <FlatList
        className="flex-1 p-4"
        data={hotels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="p-4 mb-4 bg-gray-100 rounded-lg"
            onPress={() =>
              router.push({
                pathname: "/hotels/[id]",
                params: { id: item.id },
              })
            }
          >
            <Image
              source={item.image}
              className="w-full h-32 rounded-xl mb-2"
            />
            <Text className="text-lg font-bold">{item.name}</Text>
            <Text className="text-gray-500">{item.location}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
