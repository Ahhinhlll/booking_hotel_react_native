import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { NguoiDungServices } from "../../services/NguoiDungServices";
import { DatPhongServices } from "../../services/DatPhongServices";

/**
 * Trang này xử lý callback từ MoMo sau khi thanh toán
 */
export default function MoMoResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    const processPayment = async () => {
      // Lấy thông tin từ query params
      const resultCode = params.resultCode as string;
      const orderId = params.orderId as string;
      const transId = params.transId as string;
      const message = params.message as string;
      const amount = params.amount as string;

      // Parse bookingId từ orderId (format: BOOKING_xxx_timestamp)
      let bookingId: string | null = null;
      if (orderId) {
        const match = orderId.match(/BOOKING_([^_]+)_/);
        if (match) {
          bookingId = match[1];
        }
      }

      // Lấy thông tin user
      let userInfo: any = null;
      try {
        userInfo = await NguoiDungServices.getCurrentUser();
      } catch (e) {
        // Ignore error
      }

      // Lấy thông tin booking nếu có bookingId
      let bookingInfo: any = null;
      if (bookingId) {
        try {
          const bookingResponse = await DatPhongServices.getById(bookingId);
          bookingInfo = bookingResponse;
        } catch (e) {
          // Ignore error
        }
      }

      // Kiểm tra kết quả thanh toán
      const hasResultCode = resultCode !== undefined && resultCode !== null;
      const isResultCodeSuccess = resultCode === "0" || (resultCode as any) === 0 || String(resultCode) === "0";
      const hasPaymentData = orderId && (amount || bookingId);
      const isSuccess = hasResultCode ? isResultCodeSuccess : !!hasPaymentData;
      
      setStatus(isSuccess ? "success" : "failed");

      // Chuyển trang sau 500ms
      setTimeout(() => {
        if (isSuccess) {
          router.replace({
            pathname: "/booking/success",
            params: {
              bookingData: JSON.stringify({
                bookingId: bookingId,
                maDatPhong: bookingId,
                paymentMethod: "momo",
                paymentConfirmed: true,
                momoTransId: transId,
                momoOrderId: orderId,
                finalAmount: amount ? parseInt(amount) : bookingInfo?.tongTien || 0,
                finalPrice: amount ? parseInt(amount) : bookingInfo?.tongTien || 0,
                hoTen: userInfo?.hoTen || bookingInfo?.NguoiDung?.hoTen || "Khách hàng",
                sdt: userInfo?.sdt || bookingInfo?.NguoiDung?.sdt || "",
                tenNguoiDat: userInfo?.hoTen || bookingInfo?.NguoiDung?.hoTen || "Khách hàng",
                sdtNguoiDat: userInfo?.sdt || bookingInfo?.NguoiDung?.sdt || "",
                checkInDateTime: bookingInfo?.ngayNhanPhong || bookingInfo?.checkInDateTime,
                checkOutDateTime: bookingInfo?.ngayTraPhong || bookingInfo?.checkOutDateTime,
                bookingType: bookingInfo?.loaiDatPhong || bookingInfo?.bookingType,
              }),
            },
          });
        } else {
          router.replace({
            pathname: "/(tabs)",
            params: {
              paymentError: message || "Thanh toán MoMo thất bại",
            },
          });
        }
      }, 500);
    };

    processPayment();
  }, [params]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#D82D8B" />
        <Ionicons
          name="wallet-outline"
          size={60}
          color="#D82D8B"
          style={styles.icon}
        />
        <Text style={styles.title}>Đang xử lý thanh toán...</Text>
        <Text style={styles.subtitle}>
          Vui lòng đợi trong giây lát
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    padding: 40,
  },
  icon: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});
