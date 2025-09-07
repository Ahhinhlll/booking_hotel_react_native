import { View, Animated } from "react-native";
import { useState, useRef } from "react";
import HomeHeader from "../../components/HomeHeader";
import ShortcutIcons from "../../components/ShortcutIcons";
import PromoBanner from "../../components/PromoBanner";
import HotelSection from "../../components/HotelSection";

// Mock data for hotels
const flashSaleHotels = [
  {
    id: "1",
    name: "Keypad Resident - Vinhomes...",
    rating: 5.0,
    reviews: 17,
    location: "Văn Giang",
    originalPrice: 300000,
    currentPrice: 299000,
    duration: "2 giờ",
    discount: 29,
    image: require("../../assets/images/react-logo.png"),
    featured: true,
  },
];

const specialDeals = [
  {
    id: "2",
    name: "Dat Vostro Homestay",
    rating: 4.2,
    reviews: 3,
    location: "Văn Giang",
    originalPrice: 250000,
    currentPrice: 200000,
    duration: "2 giờ",
    image: require("../../assets/images/react-logo.png"),
  },
  {
    id: "3",
    name: "Keypad Resident",
    rating: 5.0,
    reviews: 17,
    location: "Văn Giang",
    originalPrice: 300000,
    currentPrice: 299000,
    duration: "2 giờ",
    discount: 29,
    image: require("../../assets/images/react-logo.png"),
  },
];

const go2joyHotels = [
  {
    id: "4",
    name: "Dat Vostro Homestay",
    rating: 4.2,
    reviews: 3,
    location: "Văn Giang",
    originalPrice: 250000,
    currentPrice: 200000,
    duration: "2 giờ",
    image: require("../../assets/images/react-logo.png"),
  },
  {
    id: "5",
    name: "Keypad Resident",
    rating: 5.0,
    reviews: 17,
    location: "Văn Giang",
    originalPrice: 300000,
    currentPrice: 299000,
    duration: "2 giờ",
    discount: 29,
    image: require("../../assets/images/react-logo.png"),
  },
];

export default function HomeScreen() {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
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
    <View className="flex-1 bg-gray-50">
      {/* Fixed Header */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <HomeHeader isCollapsed={isHeaderCollapsed} />
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        className="flex-1"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Placeholder for header space */}
        <View style={{ height: isHeaderCollapsed ? 85 : 140 }} />
        {/* Shortcut Icons */}
        <ShortcutIcons />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Flash Sale Section */}
        <HotelSection title="Flash Sale" hotels={flashSaleHotels} />

        {/* Special Deals Section */}
        <HotelSection
          title="Ưu đãi đặc biệt"
          subtitle="Xem tất cả >"
          hotels={specialDeals}
        />

        {/* Go2Joy Suggestions */}
        <HotelSection
          title="Go2Joy gợi ý"
          subtitle="Xem tất cả >"
          hotels={go2joyHotels}
        />

        {/* Bottom padding for tab bar */}
        <View className="h-20" />
      </Animated.ScrollView>
    </View>
  );
}
