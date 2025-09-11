import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function UpdateProfileScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#FEF3E7]" style={{ paddingTop: 50 }}>
      <View className="flex-row items-center justify-between bg-white px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Hồ sơ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        className="flex-1 px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="bg-white rounded-lg p-5">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Thông tin cá nhân
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nickname</Text>
            <TextInput
              style={styles.input}
              placeholder="Joyer.974"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.countryCode}>+84</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="387238815"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="da1916671@gmail.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
            />
          </View>
        </View>

        <TouchableOpacity className="bg-orange-500 rounded-full py-4 mt-8 mx-10">
          <Text className="text-white text-center font-bold text-lg">
            Cập nhật
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    paddingVertical: 8,
    fontSize: 16,
    color: "#1F2937",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },
  countryCode: {
    fontSize: 16,
    color: "#1F2937",
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1F2937",
  },
});
