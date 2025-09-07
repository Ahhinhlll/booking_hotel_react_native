import axios from "axios";

interface Province {
  code: string;
  name: string;
}

export const fetchProvinces = async (): Promise<Province[]> => {
  try {
    const response = await axios.get("https://provinces.open-api.vn/api/p/");
    return response.data.map((province: any) => ({
      code: province.code,
      name: province.name.replace(/^Tỉnh |^Thành phố /, ""),
    }));
  } catch (error) {
    console.error("Error fetching provinces:", error);
    throw error;
  }
};
