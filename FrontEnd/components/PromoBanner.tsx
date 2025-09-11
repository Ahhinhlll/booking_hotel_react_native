// File: PromoBanner.tsx
import { View } from "react-native";
import PromoBannerSlider from "./PromoBannerSlider";

const bannerImages = [
  { id: 1, imgs: require("../assets/images/banner1.webp"), title: "Banner 1" },
  { id: 2, imgs: require("../assets/images/banner2.webp"), title: "Banner 2" },
  { id: 3, imgs: require("../assets/images/banner3.webp"), title: "Banner 3" },
];

export default function PromoBanner() {
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
      <PromoBannerSlider bannerImages={bannerImages} />
    </View>
  );
}
