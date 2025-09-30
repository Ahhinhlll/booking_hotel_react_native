import { View, Animated, Dimensions } from "react-native";
import { useState, useRef } from "react";
import HomeHeader from "../../components/HomeHeader";
import ShortcutIcons from "../../components/ShortcutIcons";
import PromoBanner from "../../components/PromoBanner";
import HotelSection from "../../components/HotelSection";
import AdviceSection from "../../components/AdviceSection";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [showFlashSale, setShowFlashSale] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const scrollOffset = event.nativeEvent.contentOffset.y;
        const shouldCollapse = scrollOffset > 50;

        if (shouldCollapse !== isHeaderCollapsed) {
          setIsHeaderCollapsed(shouldCollapse);
        }
      },
    }
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB", width: SCREEN_WIDTH }}>
      {/* Fixed Header */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          width: SCREEN_WIDTH,
          zIndex: 10,
        }}
      >
        <HomeHeader isCollapsed={isHeaderCollapsed} />
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={{ flex: 1, width: SCREEN_WIDTH }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Placeholder for header space */}
        <View style={{ height: isHeaderCollapsed ? 100 : 150 }} />

        {/* Shortcut Icons */}
        <ShortcutIcons />

        {/* Promo Banner */}
        <View style={{ marginBottom: 12 }}>
          <PromoBanner />
        </View>

        {/* Flash Sale Section */}
        {showFlashSale && (
          <HotelSection
            title="Flash Sale"
            subtitle="Nhanh tay săn deal hot 🔥 – chỉ trong hôm nay!"
            limit={5}
            backgroundImage={require("../../assets/images/flashsale.webp")}
            titleColor="#F97316"
            onExpired={() => setShowFlashSale(false)}
          />
        )}

        {/* Special Deals Section */}
        <HotelSection
          title="Ưu đãi đặc biệt"
          subtitle="Khuyến mại hấp dẫn"
          limit={5}
        />

        {/* Go2Joy Suggestions */}
        <HotelSection
          title="Go2Joy gợi ý"
          subtitle="Được đề xuất cho bạn"
          limit={5}
        />

        {/* Nearby Hotels */}
        <HotelSection
          title="Khách sạn gần bạn"
          subtitle="Trong khu vực Hưng Yên"
          searchQuery="Hưng Yên"
          limit={5}
        />

        {/* Advice Section */}
        <AdviceSection
          title="Lời khuyên cần biết"
          // subtitle="Mẹo hay cho mọi chuyến đi"
          limit={5}
        />

        {/* Bottom padding for tab bar */}
        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
}
