import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthService } from "../../services/AuthServices";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState(""); // email hoặc sdt
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ identifier: "", password: "" });
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = { identifier: "", password: "" };

    if (!identifier.trim()) {
      newErrors.identifier = "Email hoặc số điện thoại không được để trống";
      isValid = false;
    } else if (!validateEmail(identifier) && !validatePhoneNumber(identifier)) {
      newErrors.identifier = "Email hoặc số điện thoại không hợp lệ";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Mật khẩu không được để trống";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: "Thông tin không hợp lệ",
        text2: "Vui lòng kiểm tra lại thông tin đăng nhập",
        position: "top",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Starting login process...");
      const result = await AuthService.login(identifier.trim(), password);
      console.log("Login result:", result);

      if (result?.success && result?.data?.token) {
        console.log("Login successful, showing toast...");

        // Hiển thị thông báo thành công
        Toast.show({
          type: "success",
          text1: "Đăng nhập thành công 🎉",
          text2: `Chào mừng ${result.data.user?.hoTen || "bạn"}`,
          position: "top",
          visibilityTime: 2000,
        });

        console.log("Attempting to navigate...");
        // Chuyển trang ngay lập tức
        setTimeout(() => {
          console.log("Navigating to tabs...");
          router.replace("/(tabs)");
        }, 1500);
      } else {
        console.log("Login failed:", result);
        Toast.show({
          type: "error",
          text1: "Đăng nhập thất bại",
          text2: result?.message || "Sai tài khoản hoặc mật khẩu",
          position: "top",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi kết nối server",
        text2: "Vui lòng thử lại sau!",
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push("/auth/register");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-orange-400 rounded-full items-center justify-center mb-4">
            <Ionicons name="home" size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Chào mừng trở lại!
          </Text>
          <Text className="text-base text-gray-500 text-center">
            Đăng nhập để tiếp tục sử dụng ứng dụng
          </Text>
        </View>

        {/* Form */}
        <View className="w-full">
          {/* Email/Phone Input */}
          <View className="mb-5">
            <Text className="text-base font-semibold text-gray-800 mb-2">
              Email hoặc Số điện thoại
            </Text>
            <View
              className={`flex-row items-center border rounded-xl px-4 bg-gray-50 ${
                errors.identifier ? "border-red-400" : "border-gray-300"
              }`}
            >
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 py-4 px-3 text-base text-gray-800"
                placeholder="Nhập email hoặc số điện thoại"
                placeholderTextColor="#9CA3AF"
                value={identifier}
                onChangeText={(text) => {
                  setIdentifier(text);
                  if (errors.identifier)
                    setErrors({ ...errors, identifier: "" });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {errors.identifier ? (
              <Text className="text-sm mt-1" style={{ color: "red" }}>
                {errors.identifier}
              </Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-800 mb-2">
              Mật khẩu
            </Text>
            <View
              className={`flex-row items-center border rounded-xl px-4 bg-gray-50 ${
                errors.password ? "border-red-400" : "border-gray-300"
              }`}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 py-4 px-3 text-base text-gray-800"
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="p-1"
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text className=" text-sm mt-1" style={{ color: "red" }}>
                {errors.password}
              </Text>
            ) : null}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            className="self-end mb-8"
            onPress={() =>
              Toast.show({
                type: "info",
                text1: "Tính năng đang phát triển",
                text2: "Quên mật khẩu sẽ có sớm!",
                position: "top",
              })
            }
          >
            <Text className="text-orange-400 text-sm font-semibold">
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#FB923C", // cam (bg-orange-400)
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              opacity: isLoading ? 0.7 : 1,
            }}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                Đăng nhập
              </Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-500 text-base">Chưa có tài khoản?</Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text className="text-orange-400 text-base font-semibold ml-1">
                Đăng ký ngay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
