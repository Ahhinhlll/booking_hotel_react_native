import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PromotionInviteScreen({
  onBack,
}: {
  onBack?: () => void;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFF6ED" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop:
            Platform.OS === "ios"
              ? 50
              : StatusBar.currentHeight
                ? StatusBar.currentHeight + 10
                : 40,
          paddingHorizontal: 12,
          backgroundColor: "#FFF6ED",
        }}
      >
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={{ padding: 8, marginRight: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FB923C" />
          </TouchableOpacity>
        )}
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#1F2937" }}>
          Mời bạn mới nhận 50K Joy Xu
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 0, paddingBottom: 32 }}>
        {/* Banner + Mã giới thiệu */}
        <View style={{ alignItems: "center", marginTop: 0 }}>
          <View
            style={{
              width: "100%",
              backgroundColor: "#FFF6ED",
              alignItems: "center",
              paddingTop: 12,
            }}
          >
            <Ionicons
              name="people-circle-outline"
              size={80}
              color="#FB923C"
              style={{ marginBottom: 0 }}
            />
          </View>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              marginTop: -30,
              marginHorizontal: 16,
              padding: 20,
              width: "90%",
              alignItems: "center",
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 4,
              }}
            >
              Mời bạn mới nhận 50K Joy Xu
            </Text>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 14,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Gửi mã giới thiệu bên dưới cho bạn bè ngay
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F3F4F6",
                borderRadius: 10,
                padding: 12,
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Text
                selectable
                style={{ fontWeight: "bold", fontSize: 16, color: "#FB923C" }}
              >
                RP2274188
              </Text>
              <TouchableOpacity>
                <Text
                  style={{ color: "#FB923C", fontWeight: "bold", fontSize: 16 }}
                >
                  Chia sẻ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Hướng dẫn */}
        <View style={{ marginTop: 32, marginHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#1F2937",
              marginBottom: 16,
            }}
          >
            Làm sao để nhận thưởng khi mời bạn?
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <Ionicons
              name="mail-outline"
              size={28}
              color="#FB923C"
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold", color: "#1F2937" }}>
                Bước 1: Gửi mã giới thiệu
              </Text>
              <Text style={{ color: "#374151" }}>
                Sao chép hoặc chia sẻ mã giới thiệu để mời bạn bè tham gia
                chương trình
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <Ionicons
              name="person-add-outline"
              size={28}
              color="#FB923C"
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold", color: "#1F2937" }}>
                Bước 2: Người được mời tải Go2Joy và đăng ký tài khoản thành
                công
              </Text>
              <Text style={{ color: "#374151" }}>
                Người được mời sẽ nhận Coupon 50.000đ
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <Ionicons
              name="checkmark-done-circle-outline"
              size={28}
              color="#FB923C"
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold", color: "#1F2937" }}>
                Bước 3: Người được mời đặt phòng thành công lần đầu
              </Text>
              <Text style={{ color: "#374151" }}>
                Thời gian hợp lệ: 30 ngày kể từ ngày đăng ký thành công
              </Text>
              <Text style={{ color: "#374151" }}>
                - Bạn sẽ nhận được 50.000 Joy Xu
              </Text>
              <Text style={{ color: "#374151" }}>
                - Người được mời sẽ nhận được 55.000 Joy Xu
              </Text>
            </View>
          </View>
        </View>
        {/* Thể lệ chương trình */}
        <View style={{ marginTop: 24, marginHorizontal: 20 }}>
          <Text
            style={{
              fontWeight: "bold",
              color: "#1F2937",
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            Thể lệ chương trình
          </Text>
          <Text style={{ color: "#2563EB", fontSize: 15 }}>
            Xem thêm chi tiết tại đây
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
