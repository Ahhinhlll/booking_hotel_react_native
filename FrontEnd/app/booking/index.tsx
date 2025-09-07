import { View } from "react-native";
import Header from "../../components/Header";

import BookingForm from "../../components/BookingForm";

export default function BookingScreen() {
  return (
    <View className="flex-1">
      <Header title="Đặt phòng" />
      <View className="flex-1">
        <BookingForm />
      </View>
    </View>
  );
}
