import axios from "axios";

interface Province {
  code: string;
  name: string;
}

// Fallback data khi API không hoạt động - Danh sách đầy đủ các tỉnh thành Việt Nam
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
  { code: "14", name: "Sơn La" },
  { code: "15", name: "Yên Bái" },
  { code: "17", name: "Hoà Bình" },
  { code: "19", name: "Thái Nguyên" },
  { code: "20", name: "Lạng Sơn" },
  { code: "22", name: "Quảng Ninh" },
  { code: "25", name: "Bắc Giang" },
  { code: "26", name: "Phú Thọ" },
  { code: "27", name: "Vĩnh Phúc" },
  { code: "30", name: "Bắc Ninh" },
  { code: "31", name: "Hải Dương" },
  { code: "33", name: "Hưng Yên" },
  { code: "34", name: "Thái Bình" },
  { code: "35", name: "Hà Nam" },
  { code: "36", name: "Nam Định" },
  { code: "37", name: "Ninh Bình" },
  { code: "38", name: "Thanh Hóa" },
  { code: "40", name: "Nghệ An" },
  { code: "42", name: "Hà Tĩnh" },
  { code: "44", name: "Quảng Bình" },
  { code: "45", name: "Quảng Trị" },
  { code: "46", name: "Thừa Thiên Huế" },
  { code: "49", name: "Quảng Nam" },
  { code: "51", name: "Quảng Ngãi" },
  { code: "52", name: "Bình Định" },
  { code: "54", name: "Phú Yên" },
  { code: "56", name: "Khánh Hòa" },
  { code: "58", name: "Ninh Thuận" },
  { code: "60", name: "Bình Thuận" },
  { code: "62", name: "Kon Tum" },
  { code: "64", name: "Gia Lai" },
  { code: "66", name: "Đắk Lắk" },
  { code: "67", name: "Đắk Nông" },
  { code: "68", name: "Lâm Đồng" },
  { code: "70", name: "Bình Phước" },
  { code: "72", name: "Tây Ninh" },
  { code: "74", name: "Bình Dương" },
  { code: "75", name: "Đồng Nai" },
  { code: "77", name: "Bà Rịa - Vũng Tàu" },
  { code: "80", name: "Long An" },
  { code: "82", name: "Tiền Giang" },
  { code: "83", name: "Bến Tre" },
  { code: "84", name: "Trà Vinh" },
  { code: "86", name: "Vĩnh Long" },
  { code: "87", name: "Đồng Tháp" },
  { code: "89", name: "An Giang" },
  { code: "91", name: "Kiên Giang" },
  { code: "92", name: "Cà Mau" },
  { code: "93", name: "Bạc Liêu" },
  { code: "94", name: "Sóc Trăng" },
  { code: "95", name: "Hậu Giang" },
];

export const fetchProvinces = async (): Promise<Province[]> => {
  try {
    // Thử gọi API với timeout ngắn hơn
    const response = await axios.get("https://provinces.open-api.vn/api/p/", {
      timeout: 5000, // Giảm timeout xuống 5 giây
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    return response.data.map((province: any) => ({
      code: province.code?.toString() || province.code,
      name: province.name?.replace(/^Tỉnh |^Thành phố /, "") || province.name,
    }));
  } catch (error: any) {
    console.warn("⚠️ API provinces unavailable, using fallback data");
    console.warn("Error details:", error?.message || error);

    // Trả về fallback data thay vì throw error
    return fallbackProvinces;
  }
};

// Hàm để lấy provinces mà không cần gọi API
export const getProvincesOffline = (): Province[] => {
  console.log("📱 Using offline provinces data");
  return fallbackProvinces;
};
