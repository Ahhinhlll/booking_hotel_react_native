// utils/promotionUtils.ts
import { KhuyenMaiData } from "../services/KhuyenMaiServices";

/**
 * Kiểm tra khuyến mãi còn hiệu lực hay không
 * @param promotion - Đối tượng khuyến mãi
 * @returns true nếu khuyến mãi còn hiệu lực, false nếu đã hết hạn
 */
export const isPromotionValid = (promotion: KhuyenMaiData): boolean => {
  if (!promotion.ngayKetThuc) {
    // Nếu không có ngày kết thúc, coi như còn hiệu lực
    return true;
  }

  const now = new Date();
  const endDate = new Date(promotion.ngayKetThuc);
  
  // Reset thời gian về cuối ngày để so sánh chính xác
  endDate.setHours(23, 59, 59, 999);
  
  return now <= endDate;
};

/**
 * Kiểm tra khuyến mãi đã bắt đầu chưa
 * @param promotion - Đối tượng khuyến mãi
 * @returns true nếu khuyến mãi đã bắt đầu, false nếu chưa
 */
export const isPromotionStarted = (promotion: KhuyenMaiData): boolean => {
  if (!promotion.ngayBatDau) {
    // Nếu không có ngày bắt đầu, coi như đã bắt đầu
    return true;
  }

  const now = new Date();
  const startDate = new Date(promotion.ngayBatDau);
  
  // Reset thời gian về đầu ngày để so sánh chính xác
  startDate.setHours(0, 0, 0, 0);
  
  return now >= startDate;
};

/**
 * Kiểm tra khuyến mãi đang trong thời gian hiệu lực
 * @param promotion - Đối tượng khuyến mãi
 * @returns true nếu khuyến mãi đang hiệu lực, false nếu ngược lại
 */
export const isPromotionActive = (promotion: KhuyenMaiData): boolean => {
  return isPromotionStarted(promotion) && isPromotionValid(promotion);
};

/**
 * Lấy text hiển thị trạng thái khuyến mãi
 * @param promotion - Đối tượng khuyến mãi
 * @returns Chuỗi mô tả trạng thái
 */
export const getPromotionStatusText = (promotion: KhuyenMaiData): string => {
  if (!isPromotionStarted(promotion)) {
    return "Chưa bắt đầu";
  }
  if (!isPromotionValid(promotion)) {
    return "Hết chương trình khuyến mãi";
  }
  return "Đang áp dụng";
};

/**
 * Tính số ngày còn lại của khuyến mãi
 * @param promotion - Đối tượng khuyến mãi
 * @returns Số ngày còn lại, -1 nếu đã hết hạn, null nếu không có ngày kết thúc
 */
export const getDaysRemaining = (promotion: KhuyenMaiData): number | null => {
  if (!promotion.ngayKetThuc) {
    return null;
  }

  const now = new Date();
  const endDate = new Date(promotion.ngayKetThuc);
  
  // Reset thời gian để tính số ngày chính xác
  now.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Lọc danh sách khuyến mãi còn hiệu lực
 * @param promotions - Danh sách khuyến mãi
 * @returns Danh sách khuyến mãi còn hiệu lực
 */
export const filterActivePromotions = (promotions: KhuyenMaiData[]): KhuyenMaiData[] => {
  return promotions.filter(isPromotionActive);
};

/**
 * Sắp xếp khuyến mãi: còn hiệu lực trước, hết hạn sau
 * @param promotions - Danh sách khuyến mãi
 * @returns Danh sách đã sắp xếp
 */
export const sortPromotionsByStatus = (promotions: KhuyenMaiData[]): KhuyenMaiData[] => {
  return [...promotions].sort((a, b) => {
    const aActive = isPromotionActive(a);
    const bActive = isPromotionActive(b);
    
    // Khuyến mãi còn hiệu lực lên trước
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    
    // Nếu cùng trạng thái, sắp xếp theo ngày kết thúc (gần hết hạn lên trước)
    const aEndDate = a.ngayKetThuc ? new Date(a.ngayKetThuc).getTime() : Infinity;
    const bEndDate = b.ngayKetThuc ? new Date(b.ngayKetThuc).getTime() : Infinity;
    
    return aEndDate - bEndDate;
  });
};
