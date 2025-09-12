import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const demoData = [
  {
    id: "1",
    date: "26/08/2025",
    time: "14:15",
    status: "Đã huỷ",
    code: "3808835",
    hotel: "Dal Vostro Homestay",
    room: "Theo giờ | CLASSIC- HÀN QUỐC (DOUBLE)",
    price: 200000,
    payment: "atm",
  },
  {
    id: "2",
    date: "26/08/2025",
    time: "13:53",
    status: "Đã huỷ",
    code: "3808783",
    hotel: "Dal Vostro Homestay",
    room: "Theo giờ | CLASSIC- HÀN QUỐC (DOUBLE)",
    price: 150000,
    payment: "momo",
  },
  {
    id: "3",
    date: "26/08/2025",
    time: "14:15",
    status: "Đã huỷ",
    code: "3808835",
    hotel: "Dal Vostro Homestay",
    room: "Theo giờ | CLASSIC- HÀN QUỐC (DOUBLE)",
    price: 200000,
    payment: "atm",
  },
  {
    id: "4",
    date: "26/08/2025",
    time: "13:53",
    status: "Đã huỷ",
    code: "3808783",
    hotel: "Dal Vostro Homestay",
    room: "Theo giờ | CLASSIC- HÀN QUỐC (DOUBLE)",
    price: 150000,
    payment: "momo",
  },
  {
    id: "5",
    date: "26/08/2025",
    time: "14:15",
    status: "Đã huỷ",
    code: "3808835",
    hotel: "Dal Vostro Homestay",
    room: "Theo giờ | CLASSIC- HÀN QUỐC (DOUBLE)",
    price: 200000,
    payment: "atm",
  },
  {
    id: "6",
    date: "26/08/2025",
    time: "13:53",
    status: "Đã huỷ",
    code: "3808783",
    hotel: "Dal Vostro Homestay",
    room: "Theo giờ | CLASSIC- HÀN QUỐC (DOUBLE)",
    price: 150000,
    payment: "momo",
  },
];

const paymentIcon = (type: string) => {
  if (type === "atm")
    return (
      <Ionicons
        name="card-outline"
        size={18}
        color="#2563EB"
        style={{ marginRight: 4 }}
      />
    );
  if (type === "momo")
    return (
      <Ionicons
        name="logo-usd"
        size={18}
        color="#A21CAF"
        style={{ marginRight: 4 }}
      />
    );
  return null;
};

export default function BookedScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
      <View
        style={{
          //paddingTop: 10,
          paddingHorizontal: 16,
          paddingBottom: 10,
          // backgroundColor: "#fff",
        }}
      ></View>
      <FlatList
        data={demoData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 84 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.time}>{item.time}</Text>
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
              <Ionicons
                name="ellipsis-vertical"
                size={18}
                color="#9CA3AF"
                style={{ marginLeft: "auto" }}
              />
            </View>
            <Text style={styles.code}>Mã đặt phòng: {item.code}</Text>
            <Text style={styles.hotel}>{item.hotel}</Text>
            <Text style={styles.room} numberOfLines={1}>
              {item.room}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              {paymentIcon(item.payment)}
              <Text style={styles.price}>{item.price.toLocaleString()}đ</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 8, backgroundColor: "#F5F6FA" }} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 0,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  date: {
    fontSize: 13,
    color: "#6B7280",
    marginRight: 4,
    fontWeight: "500",
  },
  time: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "bold",
    marginRight: 8,
    marginLeft: 2,
  },
  statusBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  statusText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 13,
  },
  code: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
    marginTop: 2,
  },
  hotel: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "bold",
    marginBottom: 2,
  },
  room: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  price: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "bold",
    marginLeft: 2,
  },
});
