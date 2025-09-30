import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { AuthService } from "../../services/AuthServices";

export default function DeleteSuccess() {
  const router = useRouter();

  const handleFinish = async () => {
    await AuthService.logout();
    router.replace("/auth/login");
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <Image
        source={require("../../assets/images/delete_success.jpg")}
        style={{ width: 200, height: 200, resizeMode: "contain" }}
      />

      <Text className="text-lg font-semibold text-center mt-6">
        Go2Joy đã nhận được yêu cầu xóa của bạn
      </Text>
      <Text className="text-gray-600 text-center mt-2">
        Nếu có sự cố, Go2Joy sẽ liên hệ với bạn. Nếu không, bạn có thể coi như
        yêu cầu đã được xử lý.
      </Text>

      <TouchableOpacity
        onPress={handleFinish}
        className="w-full py-3 mt-10 border border-orange-500 rounded-full"
      >
        <Text className="text-center text-orange-500 font-medium">
          Hoàn thành
        </Text>
      </TouchableOpacity>
    </View>
  );
}
