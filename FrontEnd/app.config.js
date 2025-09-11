import "dotenv/config";

console.log("Environment variables:");
console.log("EXPO_PUBLIC_API_URL:", process.env.EXPO_PUBLIC_API_URL);
console.log("EXPO_PUBLIC_IMAGE_URL:", process.env.EXPO_PUBLIC_IMAGE_URL);

export default {
  expo: {
    name: "FrontEnd",
    slug: "FrontEnd",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "frontend",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_IMAGE_URL: process.env.EXPO_PUBLIC_IMAGE_URL,
    },
  },
};
