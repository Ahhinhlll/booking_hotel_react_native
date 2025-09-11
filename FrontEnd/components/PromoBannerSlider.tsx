import React, { useRef, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
} from "react-native";

interface BannerImage {
  id: number;
  imgs: ImageSourcePropType;
  title: string;
}

interface PromoBannerSliderProps {
  bannerImages: BannerImage[];
}

const { width } = Dimensions.get("window");

const PromoBannerSlider: React.FC<PromoBannerSliderProps> = ({
  bannerImages,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % bannerImages.length;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {bannerImages.map((item) => (
          <Image
            key={item.id}
            source={item.imgs}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: width - 32,
    height: 150,
  },
});

export default PromoBannerSlider;
