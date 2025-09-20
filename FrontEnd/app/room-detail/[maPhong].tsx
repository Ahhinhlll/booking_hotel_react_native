import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { PhongServices, PhongData } from "../../services/PhongServices";
import { getImageUrl } from "../../utils/getImageUrl";

export default function RoomDetailScreen() {
  const { maPhong } = useLocalSearchParams();
  const router = useRouter();
  const [room, setRoom] = useState<PhongData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (maPhong) {
      PhongServices.getById(maPhong as string)
        .then(setRoom)
        .finally(() => setLoading(false));
    }
  }, [maPhong]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!room) return <Text>Không tìm thấy phòng</Text>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Image
        source={{
          uri: Array.isArray(room.anh)
            ? getImageUrl(room.anh[0])
            : getImageUrl(room.anh),
        }}
        style={{ width: "100%", height: 220 }}
        resizeMode="cover"
      />
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          {room.tenPhong}
        </Text>
        <Text style={{ marginTop: 8 }}>Diện tích: {room.dienTich}</Text>
        <Text style={{ marginTop: 8 }}>Thông tin: {room.thongTin}</Text>
        <Text style={{ marginTop: 8 }}>Mô tả: {room.moTa}</Text>
        {/* Thêm các thông tin khác nếu cần */}
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: "#FB923C",
          margin: 16,
          borderRadius: 8,
          padding: 16,
          alignItems: "center",
        }}
        onPress={() => {
          /* Đặt phòng */
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Đặt phòng</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
