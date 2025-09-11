// File: PromoBanner.tsx
import { View } from "react-native";
import PromoBannerSlider from "./PromoBannerSlider";

const bannerImages = [
  { id: 1, imgs: require("../assets/images/banner1.webp"), title: "Banner 1" },
  { id: 2, imgs: require("../assets/images/banner2.webp"), title: "Banner 2" },
  { id: 3, imgs: require("../assets/images/banner3.webp"), title: "Banner 3" },
  { id: 4, imgs: require("../assets/images/banner4.webp"), title: "Banner 4" },
  { id: 5, imgs: require("../assets/images/banner5.webp"), title: "Banner 5" },
  { id: 6, imgs: require("../assets/images/banner6.webp"), title: "Banner 6" },
];

export default function PromoBanner() {
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
      <PromoBannerSlider bannerImages={bannerImages} />
    </View>
  );
}
