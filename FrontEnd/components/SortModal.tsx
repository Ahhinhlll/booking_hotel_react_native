import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const options = [
  "Phù hợp nhất",
  "Khoảng cách từ gần đến xa",
  "Điểm đánh giá từ cao đến thấp",
  "Giá từ thấp đến cao",
  "Giá từ cao đến thấp",
];

export default function SortModal({ visible, onClose }: any) {
  const [selected, setSelected] = useState<string>("Phù hợp nhất");

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        {/* Modal nhỏ hơn */}
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 35,
            borderTopRightRadius: 35,
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 10,
            maxHeight: "70%",
          }}
        >
          {/* Header */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold flex-1 text-center">
              Sắp xếp theo
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Options */}
          {options.map((opt, i) => (
            <View key={i}>
              <TouchableOpacity
                className="py-3 flex-row items-center justify-between"
                onPress={() => setSelected(opt)}
              >
                {/* chữ xám */}
                <Text className="text-base text-gray-600">{opt}</Text>

                {/* Radio button */}
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selected === opt ? "#f97316" : "#d1d5db",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor:
                      selected === opt ? "#f97316" : "transparent",
                  }}
                >
                  {selected === opt && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Divider */}
              {i < options.length - 1 && <View className="h-px bg-gray-200" />}
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}
