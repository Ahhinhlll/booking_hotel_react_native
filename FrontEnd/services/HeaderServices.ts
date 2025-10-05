import axios from "axios";

interface Province {
  code: string;
  name: string;
}

// Fallback data khi API không hoạt động
const fallbackProvinces: Province[] = [
  { code: "1", name: "Hà Nội" },
  { code: "79", name: "Hồ Chí Minh" },
  { code: "48", name: "Đà Nẵng" },
  { code: "24", name: "Hải Phòng" },
  { code: "4", name: "Cao Bằng" },
  { code: "6", name: "Bắc Kạn" },
  { code: "8", name: "Tuyên Quang" },
  { code: "10", name: "Lào Cai" },
  { code: "11", name: "Điện Biên" },
  { code: "12", name: "Lai Châu" },
];

export const fetchProvinces = async (): Promise<Province[]> => {
  try {
    // Thêm timeout 10 giây
    const response = await axios.get("https://provinces.open-api.vn/api/p/", {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    return response.data.map((province: any) => ({
      code: province.code?.toString() || province.code,
      name: province.name?.replace(/^Tỉnh |^Thành phố /, "") || province.name,
    }));
  } catch (error) {
    console.error("Error fetching provinces:", error);
    
    // Trả về fallback data thay vì throw error
    console.warn("Using fallback provinces data");
    return fallbackProvinces;
  }
};
