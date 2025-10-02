import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { NguoiDungServices } from "../../services/NguoiDungServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeleteAccount() {
  const router = useRouter();
  const [reason, setReason] = useState("");

  const handleConfirmDelete = () => {
    Alert.alert(
      "Xác nhận xóa tài khoản",
      "Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: handleDelete },
      ]
    );
  };

  const handleDelete = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (!userString) {
        Alert.alert(
          "Lỗi",
          "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
        );
        router.push("/auth/login");
        return;
      }
      let user;
      try {
        user = JSON.parse(userString);
      } catch {
        Alert.alert(
          "Lỗi",
          "Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại."
        );
        router.push("/auth/login");
        return;
      }
      const maND = user.maNguoiDung;
      if (!maND) {
        Alert.alert(
          "Lỗi",
          "Không tìm thấy mã người dùng. Vui lòng đăng nhập lại."
        );
        router.push("/auth/login");
        return;
      }

      await NguoiDungServices.remove(maND);
      await AsyncStorage.multiRemove(["user", "token"]);
      router.push("/other/DeleteSuccess");
    } catch (error: any) {
      console.error("Lỗi khi xóa tài khoản:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 mx-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text
          className="flex-1 text-center font-semibold text-gray-900 mr-7"
          style={{ fontSize: 19 }}
        >
          Xoá tài khoản của bạn
        </Text>
      </View>

      {/* Nội dung */}
      <ScrollView className="flex-1 px-4 pt-6" style={{ padding: 20 }}>
        <Text
          className="font-normal text-gray-900"
          style={{ fontSize: 17, marginBottom: 5 }}
        >
          Bạn sắp xoá bỏ tài khoản của mình
        </Text>

        <Text className="text-[15px] text-gray-700 leading-[22px] mb-6">
          Bằng cách nhấn vào nút
          <Text className="font-medium text-gray-900">“Xoá tài khoản”</Text> bên
          dưới, bạn tự nguyện chọn xoá tài khoản của mình hoàn toàn và không thể
          thay đổi được và bạn đồng ý thừa nhận toàn bộ trách nhiệm về mọi hậu
          quả liên quan đến việc xoá bỏ tài khoản của mình.
        </Text>

        <Text
          className="font-normal text-gray-900"
          style={{ fontSize: 17, marginBottom: 5 }}
        >
          Bằng cách xoá bỏ tài khoản của bạn, Go2Joy sẽ:
        </Text>

        <View className="mb-6">
          <Text className="text-[15px] text-orange-500 leading-[22px] mb-2">
            • Xoá bỏ tất cả thông tin trên hồ sơ
          </Text>
          <Text className="text-[15px] text-orange-500 leading-[22px]">
            • Xoá bỏ tất cả thông tin về các đơn đặt phòng trước đây
          </Text>
        </View>

        <Text className="text-[15px] font-semibold leading-[22px] mb-6">
          Xin lưu ý:{" "}
          <Text className="font-normal text-gray-900">
            Nếu 120 ngày chưa trôi qua kể từ ngày đặt phòng hoặc ngày trả phòng
            cuối cùng của bạn, Go2Joy không thể xoá bỏ tài khoản của bạn ngay
            lập tức do mục đích kiểm tra. Go2Joy sẽ ghi nhận đơn xin xoá bỏ tài
            khoản của bạn và tiến hành xoá bỏ tài khoản 120 ngày sau ngày đặt
            phòng hoặc trả phòng cuối cùng của bạn.
          </Text>
        </Text>

        <Text
          className="font-normal text-gray-900"
          style={{ fontSize: 17, marginBottom: 10 }}
        >
          Tại sao bạn muốn xoá tài khoản của mình?
        </Text>
        <View className="border border-gray-300 rounded-lg overflow-hidden mb-10">
          <Picker
            selectedValue={reason}
            onValueChange={(value) => setReason(value)}
            style={{ height: 60 }}
          >
            <Picker.Item label="Chọn lý do (không bắt buộc)" value="" />
            <Picker.Item label="Không còn nhu cầu sử dụng" value="no-need" />
            <Picker.Item label="Bảo mật thông tin" value="security" />
            <Picker.Item label="Ứng dụng không phù hợp" value="not-fit" />
          </Picker>
        </View>
      </ScrollView>

      {/* Nút */}
      <View
        className="flex-row px-4 py-4 border-t border-gray-200 justify-between"
        style={{ marginBottom: 15 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="py-3.5 mr-2"
          style={{
            paddingTop: 15,
            paddingBottom: 15,
            width: 120,
            alignItems: "center",
          }}
        >
          <Text
            className="text-gray-700 font-medium"
            style={{
              fontSize: 18,
              textDecorationLine: "underline", // Gạch dưới chữ
            }}
          >
            Huỷ bỏ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleConfirmDelete}
          className="py-3.5 ml-2 bg-orange-500 rounded-full"
          style={{
            paddingTop: 15,
            paddingBottom: 15,
            width: 150, // Giảm độ rộng
            alignItems: "center",
          }}
        >
          <Text className="text-white font-semibold" style={{ fontSize: 18 }}>
            Xoá tài khoản
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
