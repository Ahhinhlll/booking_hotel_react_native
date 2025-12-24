// components/PromotionStatusBadge.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { KhuyenMaiData } from "../services/KhuyenMaiServices";
import { isPromotionActive, getPromotionStatusText, getDaysRemaining } from "../utils/promotionUtils";

interface PromotionStatusBadgeProps {
  promotion: KhuyenMaiData;
  showDaysRemaining?: boolean;
}

export default function PromotionStatusBadge({ 
  promotion, 
  showDaysRemaining = false 
}: PromotionStatusBadgeProps) {
  const isActive = isPromotionActive(promotion);
  const statusText = getPromotionStatusText(promotion);
  const daysRemaining = getDaysRemaining(promotion);

  // Nếu còn hiệu lực và không cần hiện số ngày còn lại, không render gì
  if (isActive && !showDaysRemaining) {
    return null;
  }

  // Nếu còn hiệu lực và cần hiện số ngày còn lại
  if (isActive && showDaysRemaining && daysRemaining !== null) {
    const isExpiringSoon = daysRemaining <= 3;
    
    return (
      <View style={[
        styles.badge, 
        isExpiringSoon ? styles.expiringSoonBadge : styles.activeBadge
      ]}>
        <Text style={[
          styles.badgeText,
          isExpiringSoon ? styles.expiringSoonText : styles.activeText
        ]}>
          {daysRemaining === 0 
            ? "Hết hạn hôm nay" 
            : daysRemaining === 1 
              ? "Còn 1 ngày"
              : `Còn ${daysRemaining} ngày`}
        </Text>
      </View>
    );
  }

  // Nếu đã hết hạn
  if (!isActive) {
    return (
      <View style={[styles.badge, styles.expiredBadge]}>
        <Text style={[styles.badgeText, styles.expiredText]}>
          {statusText}
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  // Styles cho khuyến mãi còn hiệu lực
  activeBadge: {
    backgroundColor: "#10B981",
  },
  activeText: {
    color: "#FFFFFF",
  },
  // Styles cho khuyến mãi sắp hết hạn (còn <= 3 ngày)
  expiringSoonBadge: {
    backgroundColor: "#F59E0B",
  },
  expiringSoonText: {
    color: "#FFFFFF",
  },
  // Styles cho khuyến mãi đã hết hạn
  expiredBadge: {
    backgroundColor: "#EF4444",
  },
  expiredText: {
    color: "#FFFFFF",
  },
});
