// utils/jwtDecode.ts
export const decodeToken = (token: string): any => {
  try {
    // JWT có cấu trúc header.payload.signature
    const parts = token.split(".");

    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    // Giải mã payload (phần giữa)
    const payload = parts[1];

    // Thêm padding nếu cần
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);

    // Giải mã base64
    const decodedPayload = atob(
      paddedPayload.replace(/-/g, "+").replace(/_/g, "/")
    );

    // Parse JSON
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    throw new Error("Could not decode token");
  }
};
