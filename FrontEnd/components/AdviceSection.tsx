import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { advices, Advice } from "../services/data/adviceData";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface AdviceSectionProps {
  title: string;
  subtitle?: string;
  limit?: number;
}

export default function AdviceSection(props: AdviceSectionProps) {
  const [list, setList] = useState<Advice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAdviceData = async () => {
      try {
        setLoading(true);
        // Lấy số lượng giới hạn (nếu có)
        const sliced = props.limit ? advices.slice(0, props.limit) : advices;
        setList(sliced);
      } finally {
        setLoading(false);
      }
    };
    fetchAdviceData();
  }, [props.limit]);

  const handleViewAllAdvice = () => {
    router.push("/other/AdviceListScreen");
  };

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>{props.title}</Text>
          {props.subtitle && (
            <Text style={styles.subtitle}>{props.subtitle}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={handleViewAllAdvice}
        >
          <Text style={styles.linkText}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll Cards */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 12 }}
        >
          {list.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={handleViewAllAdvice}
            >
              <Image source={item.image} style={styles.image} />
              <Text numberOfLines={2} style={styles.title}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 15, marginBottom: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 18,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  linkContainer: { flexDirection: "row", alignItems: "center" },
  linkText: { fontSize: 13, color: "#9CA3AF", marginRight: 3 },

  card: {
    width: 235,
    marginRight: 14,
  },
  image: { width: "100%", height: 150, borderRadius: 12 },
  title: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
  },
  loadingContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
});
