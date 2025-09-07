import { View, TextInput, Button } from "react-native";
import Header from "../../components/Header";

export default function RegisterScreen() {
  return (
    <View className="flex-1 bg-white">
      <Header title="Đăng ký" />
      <View className="p-4">
        <TextInput placeholder="Tên" className="border p-2 rounded mb-2" />
        <TextInput placeholder="Email" className="border p-2 rounded mb-2" />
        <TextInput
          placeholder="Mật khẩu"
          secureTextEntry
          className="border p-2 rounded mb-2"
        />
        <Button title="Đăng ký" onPress={() => alert("Đăng ký thành công!")} />
      </View>
    </View>
  );
}
