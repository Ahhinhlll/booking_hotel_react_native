import "dotenv/config";
import os from "os";

// Function to get the local IPv4 address of the machine
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const ifaceName of Object.keys(interfaces)) {
    const iface = interfaces[ifaceName];
    if (iface) {
      for (const alias of iface) {
        // Find the first non-internal IPv4 address
        if (alias.family === "IPv4" && !alias.internal) {
          console.log(`Local IP address: ${alias.address}`);
          return alias.address;
        }
      }
    }
  }
  // Fallback for cases where no IP is found (e.g., no network connection)
  return "localhost";
}

const ipAddress = getLocalIpAddress();
console.log(ipAddress);
const port = 3333;
// Use the dynamically found IP address for the API URL
const apiUrl = `http://${ipAddress}:${port}`;

console.log("Using API URL:", apiUrl);

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
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
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
  },
};
