import "dotenv/config";
import os from "os";

// Function to get the local IPv4 address of the machine
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const ifaceName of Object.keys(interfaces)) {
    const iface = interfaces[ifaceName];
    if (iface) {
      for (const alias of iface) {
        if (alias.family === "IPv4" && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  return "localhost";
}

const ipAddress = getLocalIpAddress();
//console.log(ipAddress);
const port = 3333;
// Use the dynamically found IP address for the API URL
const apiUrl = `http://${ipAddress}:${port}`;

export default {
  expo: {
    name: "FrontEnd",
    slug: "FrontEnd",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "frontend",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "YOUR_IOS_API_KEY",
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Ứng dụng cần quyền truy cập vị trí để hiển thị khách sạn gần bạn trên bản đồ",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Ứng dụng cần quyền truy cập vị trí để hiển thị khách sạn gần bạn trên bản đồ",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.frontend", // Thêm package name cho Android
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || "YOUR_ANDROID_API_KEY",
        },
      },
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
      ],
      // Cho phép query MoMo app
      intentFilters: [
        {
          action: "VIEW",
          data: [{ scheme: "momo" }],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: ["expo-router"],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      EXPO_PUBLIC_API_URL: apiUrl,
      EXPO_PUBLIC_IMAGE_URL: apiUrl,
    },
    // Thêm cấu hình Hermes để đảm bảo tương thích với Reanimated
    jsEngine: "hermes",
  },
};
