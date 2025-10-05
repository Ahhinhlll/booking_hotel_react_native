import Constants from "expo-constants";

// Thử lấy từ nhiều nguồn khác nhau
const IMAGE_URL = (
  Constants.expoConfig?.extra?.EXPO_PUBLIC_IMAGE_URL ||
  Constants.manifest?.extra?.EXPO_PUBLIC_IMAGE_URL ||
  process.env.EXPO_PUBLIC_IMAGE_URL
)?.replace("3334", "3333");

export const getImageUrl = (path?: string | string[]) => {
  if (!IMAGE_URL) {
    return undefined;
  }

  if (!path) {
    return undefined;
  }

  let finalPath: string;

  if (Array.isArray(path) && path.length > 0) {
    finalPath = path[0];
  } else if (typeof path === "string") {
    finalPath = path;
  } else {
    return undefined;
  }

  // Đảm bảo path bắt đầu bằng "/"
  if (!finalPath.startsWith("/")) {
    finalPath = "/" + finalPath;
  }

  // If it looks like a filename (has timestamp pattern), add /uploads/ prefix
  if (finalPath.match(/^\/(\d+\.(jpg|jpeg|png|gif|webp|svg))$/i)) {
    finalPath = `/uploads${finalPath}`;
  }

  const fullUrl = `${IMAGE_URL}${finalPath}`;

  return fullUrl;
};
