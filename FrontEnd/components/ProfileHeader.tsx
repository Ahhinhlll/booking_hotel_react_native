import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getImageUrl } from "../utils/getImageUrl";

interface ProfileHeaderProps {
  userData: {
    hoTen: string;
    sdt: string;
    anhNguoiDung?: string | string[];
  } | null;
}

export default function ProfileHeader({ userData }: ProfileHeaderProps) {
  const router = useRouter();

  const handleEditProfile = () => {
    router.push("/(profile)/update-profile");
  };

  return (
    <View
      style={{
        backgroundColor: "#FEF3E7",
        paddingTop:
          Platform.OS === "ios"
            ? 50
            : StatusBar.currentHeight
              ? StatusBar.currentHeight + 10
              : 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
      }}
    >
      {/* User Info Section */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {/* Avatar */}
          <View className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 mr-4">
            {userData?.anhNguoiDung && (
              <Image
                source={{ uri: getImageUrl(userData?.anhNguoiDung) }}
                className="w-16 h-16"
                resizeMode="cover"
              />
            )}
          </View>

          {/* User Details */}
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">
              {userData?.hoTen || "Joyer.974"}
            </Text>
            <Text className="text-base text-gray-600 mt-1">
              {userData?.sdt || "+84 387238815"}
            </Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={24} color="#FB923C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
