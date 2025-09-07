import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          backgroundColor: "#F3F4F6",
          paddingVertical: 5,
          position: "absolute", // Đặt tab bar ở vị trí cố định
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0, // Loại bỏ bóng trên Android
          borderTopWidth: 0, // Loại bỏ viền trên iOS
        },
        tabBarHideOnKeyboard: true, // Ẩn tab bar khi bàn phím hiện lên
      }}
    >
      {/* 4 tab chính */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="suggest"
        options={{
          title: "Đề xuất",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="rocket" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="booked"
        options={{
          title: "Phòng đã đặt",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="promotions"
        options={{
          title: "Ưu đãi",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />

      {/* Không thêm các stack phụ vào Tabs để không chiếm slot navBottom */}
    </Tabs>
  );
}
