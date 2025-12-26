// services/ChatBoxServices.ts
import request from "../utils/request";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: {
    userMessage: string;
    aiResponse: string;
    timestamp: string;
  };
}

export const ChatBoxServices = {
  // Gửi tin nhắn và nhận phản hồi từ AI
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const res = await request.post<ChatResponse>("/chatbox/chat", { message });
    return res.data;
  },

  // Lấy danh sách khách sạn
  getHotels: async () => {
    const res = await request.get("/chatbox/hotels");
    return res.data;
  },

  // Tìm kiếm khách sạn
  searchHotels: async (keyword: string) => {
    const res = await request.get(`/chatbox/hotels/search?keyword=${keyword}`);
    return res.data;
  },

  // Lấy thông tin đầy đủ khách sạn
  getHotelFullInfo: async (maKS: string) => {
    const res = await request.get(`/chatbox/hotels/${maKS}/full-info`);
    return res.data;
  },
};
