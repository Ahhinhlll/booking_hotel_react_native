import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useState, useEffect } from "react";
import { advices, Advice } from "../../services/data/adviceData";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AdviceListScreen() {
  const router = useRouter();
  const [adviceList, setAdviceList] = useState<Advice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setAdviceList(advices);
      setLoading(false);
    }, 800);
  }, []);

  const renderAdviceItem = ({ item }: { item: Advice }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.titleRow}>
        <View style={styles.orangeBar} />
        <Text style={styles.title}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lời khuyên cần biết</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Body */}
      <FlatList
        data={adviceList}
        keyExtractor={(item) => item.id}
        renderItem={renderAdviceItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  backIcon: { fontSize: 20, color: "#111827" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" }, // to hơn

  // Card
  card: {
    marginBottom: 28,
    alignSelf: "center",
    width: "90%",
  },
  image: { width: "100%", height: 200, borderRadius: 10 },
  titleRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  orangeBar: {
    width: 3,
    height: 26,
    backgroundColor: "#F97316",
    marginRight: 6,
    borderRadius: 2,
  },
  title: { fontSize: 14, fontWeight: "400", color: "#6B7280", flex: 1 },
});
