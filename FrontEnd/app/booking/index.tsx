import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function BookingIndexScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="calendar-outline" size={80} color="#FB923C" />
        </View>

        <Text style={styles.title}>Đặt phòng</Text>

        <Text style={styles.subtitle}>
          Chọn phòng và thời gian để bắt đầu đặt phòng
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(tabs)")}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Tìm khách sạn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/(tabs)/booked")}
        >
          <Ionicons name="list" size={20} color="#FB923C" />
          <Text style={styles.secondaryButtonText}>Xem đơn đã đặt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#FB923C",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FB923C",
  },
  secondaryButtonText: {
    color: "#FB923C",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
