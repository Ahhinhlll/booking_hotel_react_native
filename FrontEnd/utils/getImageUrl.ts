import Constants from "expo-constants";

// Thử lấy từ nhiều nguồn khác nhau
const IMAGE_URL = (
  Constants.expoConfig?.extra?.EXPO_PUBLIC_IMAGE_URL ||
  Constants.manifest?.extra?.EXPO_PUBLIC_IMAGE_URL ||
  process.env.EXPO_PUBLIC_IMAGE_URL
)?.replace("3334", "3333");

console.log("IMAGE_URL:", IMAGE_URL);

export const getImageUrl = (path?: string | string[]) => {
  if (!IMAGE_URL) {
    console.warn("IMAGE_URL is not configured. Please check your .env file");
    return undefined;
  }

  if (!path) {
    console.log("Path is undefined or null");
    return undefined;
  }

  let finalPath: string;

  if (Array.isArray(path) && path.length > 0) {
    finalPath = path[0];
  } else if (typeof path === "string") {
    finalPath = path;
  } else {
    console.log("Invalid path type:", typeof path);
    return undefined;
  }

  // Đảm bảo path bắt đầu bằng "/"
  if (!finalPath.startsWith("/")) {
    finalPath = "/" + finalPath;
  }

  const fullUrl = `${IMAGE_URL}${finalPath}`;
  console.log("Generated URL:", fullUrl);

  return fullUrl;
};
