import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";

export default function MapScreen() {
  const { hotelName, address, lat, lng } = useLocalSearchParams();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address as string)}`;
    Linking.openURL(url);
  };

  const handleCopyAddress = () => {
    // Copy address to clipboard
    // Clipboard.setString(address as string);
    console.log("Address copied:", address);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 40,
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: "#FFFFFF",
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
          Bản đồ
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Map Placeholder */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#F3F4F6",
          justifyContent: "center",
          alignItems: "center",
          margin: 16,
          borderRadius: 12,
        }}
      >
        <Ionicons name="map" size={64} color="#9CA3AF" />
        <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 16 }}>
          Bản đồ sẽ được tích hợp Google Maps
        </Text>
        <Text style={{ fontSize: 14, color: "#9CA3AF", marginTop: 8 }}>
          Tọa độ: {lat}, {lng}
        </Text>
      </View>

      {/* Bottom Sheet */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 16,
          paddingVertical: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
      >
        {/* Google Maps Button */}
        <TouchableOpacity
          onPress={handleOpenGoogleMaps}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              backgroundColor: "#4285F4",
              borderRadius: 10,
              marginRight: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="location" size={12} color="#FFFFFF" />
          </View>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}>
            Mở Google Maps
          </Text>
        </TouchableOpacity>

        {/* Hotel Info */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#1F2937",
            marginBottom: 8,
          }}
        >
          {hotelName}
        </Text>

        {/* Address */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: "#6B7280", flex: 1 }}>
            {address}
          </Text>
          <TouchableOpacity onPress={handleCopyAddress}>
            <Ionicons name="copy" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Distance */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="location" size={16} color="#6B7280" />
          <Text style={{ fontSize: 14, color: "#6B7280", marginLeft: 4 }}>
            Cách bạn 8.9km
          </Text>
        </View>

        {/* Bottom indicator */}
        <View
          style={{
            width: 40,
            height: 4,
            backgroundColor: "#E5E7EB",
            borderRadius: 2,
            alignSelf: "center",
            marginTop: 16,
          }}
        />
      </View>
    </View>
  );
}
