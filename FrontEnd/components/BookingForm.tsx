import { View, TextInput, Button } from "react-native";

export default function BookingForm() {
  return (
    <View className="p-4">
      <TextInput
        placeholder="Tên khách hàng"
        className="border p-2 rounded mb-2"
      />
      <TextInput
        placeholder="Ngày nhận phòng"
        className="border p-2 rounded mb-2"
      />
      <TextInput
        placeholder="Ngày trả phòng"
        className="border p-2 rounded mb-2"
      />
      <Button
        title="Đặt phòng"
        onPress={() => alert("Đặt phòng thành công!")}
      />
    </View>
  );
}
