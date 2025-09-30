import { View, Text, TouchableOpacity, Switch, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function TaiKhoanScreen() {
  const router = useRouter();
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  return (
    <View className="flex-1 bg-white px-1 py-5 mt-4">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-semibold">
          Thiết lập tài khoản
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tài khoản */}
      <View className="mt-2">
        <Text className="px-4 py-2 text-lg font-semibold">Tài khoản</Text>

        <TouchableOpacity className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center space-x-3">
            <Ionicons
              name="keypad-outline"
              size={20}
              color="#666"
              style={{ marginRight: 10 }}
            />
            <Text className="text-base text-gray-500">Tạo mã PIN</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center space-x-3">
            <Ionicons
              name="git-network-outline"
              size={20}
              color="#666"
              style={{ marginRight: 10 }}
            />
            <Text className="text-base text-gray-500">Liên kết tài khoản</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/other/DeleteAccount")}
          className="flex-row items-center justify-between px-4 py-3"
        >
          <View className="flex-row items-center space-x-3">
            <Ionicons
              name="person-remove-outline"
              size={20}
              color="#666"
              style={{ marginRight: 10 }}
            />
            <Text className="text-base text-gray-500">Xóa tài khoản</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Bảo mật */}
      <View className="mt-4">
        <Text className="px-4 py-2 text-lg font-semibold">Bảo mật</Text>

        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <View>
            <Text className="text-base">Đăng nhập bằng sinh trắc học</Text>
            <Text className="text-sm text-gray-400 mt-1 w-64">
              Dùng vân tay/khuôn mặt để đăng nhập nhanh chóng và an toàn
            </Text>
          </View>
          <Switch
            style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
            value={isBiometricEnabled}
            onValueChange={setIsBiometricEnabled}
            trackColor={{ false: "#d1d5db", true: "#FFD6B8" }}
            thumbColor={isBiometricEnabled ? "#FF6600" : "#f4f3f4"}
            ios_backgroundColor="#d1d5db"
          />
        </View>
      </View>
    </View>
  );
}
