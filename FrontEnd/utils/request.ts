import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Dynamically gets the development machine's IP address from the Expo manifest.
 * This allows the app to connect to a local backend server without manual IP configuration.
 */
const getDevHostIp = () => {
  // `Constants.expoConfig.hostUri` is the recommended way for modern Expo projects.
  // It includes the port number, so we need to split it.
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(":")[0];
  }

  // Fallback for older "classic" manifest environments.
  if (Constants.manifest?.debuggerHost) {
    return Constants.manifest.debuggerHost.split(":")[0];
  }

  // A final fallback that might work in some edge cases.
  if (Constants.manifest2?.extra?.expoClient?.hostUri) {
    return Constants.manifest2.extra.expoClient.hostUri.split(":")[0];
  }

  return null;
};

const devHostIp = getDevHostIp();

// If we found an IP, use it. Otherwise, fall back to localhost (for web, etc.).
const baseURL = devHostIp
  ? `http://${devHostIp}:3333/api`
  : "http://localhost:3333/api";

/**
 * A pre-configured instance of axios for making API requests.
 * It automatically handles using your local IP for Android development.
 */
const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
