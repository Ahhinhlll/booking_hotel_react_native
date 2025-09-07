import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SearchScreen() {
  const [activeTab, setActiveTab] = useState("theo_gio");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState("Bắt ký");
  const [checkOutDate, setCheckOutDate] = useState("Bắt ký");
  const router = useRouter();

  const tabs = [
    { id: "theo_gio", label: "Theo giờ", icon: "time-outline" },
    { id: "qua_dem", label: "Qua đêm", icon: "moon-outline" },
    { id: "theo_ngay", label: "Theo ngày", icon: "calendar-outline" },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 py-3 pt-12 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold">
            Tìm kiếm khách sạn
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`flex-1 items-center py-4 ${activeTab === tab.id ? "border-b-2 border-orange-500" : ""}`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={activeTab === tab.id ? "#FB923C" : "#9CA3AF"}
            />
            <Text
              className={`mt-1 text-sm ${activeTab === tab.id ? "text-orange-500 font-semibold" : "text-gray-500"}`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Form */}
      <View className="p-4">
        {/* Location Search */}
        <TouchableOpacity
          className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 mb-4"
          onPress={() => setShowLocationModal(true)}
        >
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <Text className="flex-1 ml-3 text-gray-500">
            Tìm địa điểm, khách sạn
          </Text>
          <Ionicons name="navigate" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Date Selection */}
        <View className="flex-row">
          <TouchableOpacity className="flex-1 border border-gray-300 rounded-lg px-4 py-3 mr-2">
            <Text className="text-gray-500 text-sm">Nhận phòng</Text>
            <Text className="text-orange-500 font-semibold mt-1">
              {checkInDate}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 border border-gray-300 rounded-lg px-4 py-3 ml-2">
            <Text className="text-gray-500 text-sm">Trả phòng</Text>
            <Text className="text-orange-500 font-semibold mt-1">
              {checkOutDate}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Button */}
        <TouchableOpacity className="bg-orange-500 rounded-lg py-4 mt-6">
          <Text className="text-white text-center text-lg font-semibold">
            Tìm kiếm
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View className="flex-1 bg-white">
          <View className="bg-white px-4 py-3 pt-12 border-b border-gray-200">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text className="flex-1 text-center text-lg font-semibold">
                Tìm địa điểm
              </Text>
            </View>
          </View>

          <View className="p-4">
            <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 mb-4">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Tìm địa điểm, khách sạn"
                className="flex-1 ml-3 text-gray-700"
                autoFocus
              />
            </View>

            <TouchableOpacity className="flex-row items-center py-4">
              <Ionicons name="navigate" size={20} color="#9CA3AF" />
              <Text className="ml-3 text-gray-700">Gần tôi (Hưng Yên)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
