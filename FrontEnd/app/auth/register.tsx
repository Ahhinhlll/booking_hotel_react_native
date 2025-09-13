import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Link, useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import { NguoiDungServices } from "../../services/NguoiDungServices";

const steps = ["Thông tin", "Email", "Mật khẩu", "Xác nhận"];
type StepType = 1 | 2 | 3 | 4;

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function RegisterScreen() {
  const [step, setStep] = useState<StepType>(1);
  const [success, setSuccess] = useState(false);
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sdt, setSdt] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [anhNguoiDung, setAnhNguoiDung] = useState("");
  const [maVaiTro, setMaVaiTro] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (step >= 1) {
      if (!hoTen.trim()) e.hoTen = "Vui lòng nhập họ tên";
      if (!sdt.trim()) e.sdt = "Vui lòng nhập số điện thoại";
      else if (!/^\d{9,15}$/.test(sdt)) e.sdt = "Số điện thoại không hợp lệ";
      if (!diaChi.trim()) e.diaChi = "Vui lòng nhập địa chỉ";
      // maVaiTro không bắt buộc, mặc định backend sẽ gán nếu không có
    }
    if (step >= 2) {
      if (!email.trim()) e.email = "Vui lòng nhập email";
      else if (!validateEmail(email)) e.email = "Email không hợp lệ";
    }
    if (step >= 3) {
      if (password.length < 6) e.password = "Mật khẩu tối thiểu 6 ký tự";
      if (confirmPassword !== password)
        e.confirmPassword = "Xác nhận không khớp";
    }
    return e;
  }, [step, hoTen, sdt, diaChi, email, password, confirmPassword]);

  const isStepValid = useMemo(() => {
    if (step === 1)
      return (
        hoTen.trim() && sdt.trim() && /^\d{9,15}$/.test(sdt) && diaChi.trim()
      );
    if (step === 2) return email.trim() && validateEmail(email);
    if (step === 3) return password.length >= 6 && confirmPassword === password;
    return true;
  }, [step, hoTen, sdt, diaChi, email, password, confirmPassword]);

  const goNext = () => {
    if (step === 1)
      setTouched((t) => ({ ...t, hoTen: true, sdt: true, diaChi: true }));
    if (step === 2) setTouched((t) => ({ ...t, email: true }));
    if (step === 3)
      setTouched((t) => ({ ...t, password: true, confirmPassword: true }));
    if (isStepValid && step < 4) setStep((s) => (s + 1) as StepType);
  };
  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as StepType) : s));

  const handleRegister = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      await NguoiDungServices.insert({
        maNguoiDung: "", // backend sẽ tự sinh
        hoTen,
        email,
        matKhau: password,
        sdt,
        diaChi,
        anhNguoiDung: anhNguoiDung ? [anhNguoiDung] : undefined,
        maVaiTro: maVaiTro || "",
        trangThai: "Hoạt động",
      });
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#FB923C" />
      </View>
    );
  }

  if (success) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          padding: 24,
        }}
      >
        <CheckCircle size={64} color="#4CAF50" />
        <Text
          style={{
            marginTop: 24,
            fontSize: 18,
            fontWeight: "bold",
            color: "#222",
          }}
        >
          Đăng ký thành công!
        </Text>
        <Text style={{ marginTop: 8, color: "#666", textAlign: "center" }}>
          Bạn có thể đăng nhập bằng tài khoản vừa tạo.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#FB923C",
            borderRadius: 12,
            marginTop: 24,
            paddingVertical: 12,
            paddingHorizontal: 32,
          }}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            Quay lại đăng nhập
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#f9fafb" }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 40,
      }}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, paddingHorizontal: 0, paddingVertical: 0 }}>
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Image
              source={require("../../assets/images/logomeomeo.jpg")}
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#1F2937",
                marginTop: 8,
              }}
            >
              Đăng ký tài khoản
            </Text>
          </View>
          <Stepper step={step} />
          <View
            style={{
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: 20,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {step === 1 && (
              <>
                <Input
                  label="Họ tên"
                  value={hoTen}
                  onChangeText={(v: string) => {
                    setHoTen(v);
                    setTouched((t) => ({ ...t, hoTen: true }));
                  }}
                  placeholder="Nhập họ tên"
                  error={touched.hoTen && errors.hoTen}
                />
                <Input
                  label="Số điện thoại"
                  value={sdt}
                  onChangeText={(v: string) => {
                    setSdt(v);
                    setTouched((t) => ({ ...t, sdt: true }));
                  }}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                  error={touched.sdt && errors.sdt}
                />
                <Input
                  label="Địa chỉ"
                  value={diaChi}
                  onChangeText={(v: string) => {
                    setDiaChi(v);
                    setTouched((t) => ({ ...t, diaChi: true }));
                  }}
                  placeholder="Nhập địa chỉ"
                  error={touched.diaChi && errors.diaChi}
                />
              </>
            )}
            {step === 2 && (
              <Input
                label="Email"
                value={email}
                onChangeText={(v: string) => {
                  setEmail(v);
                  setTouched((t) => ({ ...t, email: true }));
                }}
                placeholder="your@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                error={touched.email && errors.email}
              />
            )}
            {step === 3 && (
              <>
                <Input
                  label="Mật khẩu"
                  value={password}
                  onChangeText={(v: string) => {
                    setPassword(v);
                    setTouched((t) => ({ ...t, password: true }));
                  }}
                  placeholder="Tối thiểu 6 ký tự"
                  secureTextEntry
                  error={touched.password && errors.password}
                />
                <View style={{ height: 12 }} />
                <Input
                  label="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChangeText={(v: string) => {
                    setConfirmPassword(v);
                    setTouched((t) => ({ ...t, confirmPassword: true }));
                  }}
                  placeholder="Nhập lại mật khẩu"
                  secureTextEntry
                  error={touched.confirmPassword && errors.confirmPassword}
                />
              </>
            )}
            {step === 4 && (
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#1F2937",
                    marginBottom: 12,
                  }}
                >
                  Xác nhận thông tin
                </Text>
                <Row label="Họ tên" value={hoTen} />
                <Row label="Số điện thoại" value={sdt} />
                <Row label="Địa chỉ" value={diaChi} />
                <Row label="Email" value={email} />
                <Text style={{ color: "#888", fontSize: 12, marginTop: 8 }}>
                  * Mật khẩu được ẩn vì lý do bảo mật
                </Text>
              </View>
            )}
            {!!errorMsg && (
              <Text
                style={{ color: "#f00", marginTop: 12, textAlign: "center" }}
              >
                {errorMsg}
              </Text>
            )}
          </View>
          <View style={{ marginTop: 24, flexDirection: "row", gap: 12 }}>
            {step > 1 && (
              <Button
                gray
                onPress={goBack}
                disabled={loading}
                label="Quay lại"
              />
            )}
            {step < 4 ? (
              <Button
                orange
                disabled={!isStepValid || loading}
                onPress={goNext}
                label="Tiếp tục"
              />
            ) : (
              <Button
                orange
                disabled={loading}
                onPress={handleRegister}
                loading={loading}
                label="Đăng ký"
              />
            )}
          </View>
          <View
            style={{
              marginTop: 32,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#666" }}>Đã có tài khoản? </Text>
            <Link href="/auth/login">
              <Text style={{ color: "#FB923C", fontWeight: "bold" }}>
                Đăng nhập
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAwareScrollView>
  );
}

function Stepper({ step }: { step: StepType }) {
  return (
    <View style={{ width: "100%", marginBottom: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {steps.map((_, idx) => {
          const index = (idx + 1) as StepType;
          const active = step === index;
          const done = step > index;
          return (
            <React.Fragment key={index}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: done
                    ? "#4CAF50"
                    : active
                      ? "#FB923C"
                      : "#E5E7EB",
                }}
              >
                {done ? (
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>✓</Text>
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {index}
                  </Text>
                )}
              </View>
              {index !== 4 && (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: "#E5E7EB",
                    marginHorizontal: 4,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
      <View
        style={{
          width: "100%",
          height: 8,
          backgroundColor: "#F3F4F6",
          borderRadius: 4,
          overflow: "hidden",
          marginTop: 8,
        }}
      >
        <View
          style={{
            width: `${((step - 1) / 3) * 100}%`,
            height: 8,
            backgroundColor: "#FB923C",
          }}
        />
      </View>
    </View>
  );
}

function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  ...props
}: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, color: "#374151", marginBottom: 6 }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: error ? "#f00" : "#E5E7EB",
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === "ios" ? 14 : 8,
          backgroundColor: "#F9FAFB",
        }}
      >
        <TextInput
          style={{ flex: 1, fontSize: 16, color: "#222" }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
      </View>
      {error && (
        <Text style={{ color: "#f00", fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
      }}
    >
      <Text style={{ color: "#888" }}>{label}</Text>
      <Text style={{ color: "#222", fontWeight: "bold" }}>{value || "-"}</Text>
    </View>
  );
}

function Button({ orange, gray, label, onPress, disabled, loading }: any) {
  return (
    <TouchableOpacity
      style={{
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: orange
          ? disabled
            ? "#FDBA74"
            : "#FB923C"
          : "#E5E7EB",
        opacity: disabled ? 0.7 : 1,
        alignItems: "center",
        justifyContent: "center",
      }}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text
          style={{
            color: orange ? "#fff" : "#222",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
