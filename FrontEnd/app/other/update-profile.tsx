import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";
import { NguoiDungServices, UserData } from "../../services/NguoiDungServices";
import { getImageUrl } from "../../utils/getImageUrl";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import request from "../../utils/request";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

const profileSchema = z.object({
  hoTen: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  sdt: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
  diaChi: z.string().optional(),
  anhNguoiDung: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Enhanced Floating Label Input
const FloatingInput = ({
  label,
  value,
  onChangeText,
  error,
  icon,
  keyboardType = "default",
  multiline = false,
  editable = true,
  secureTextEntry = false,
}: any) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-6">
      <View
        className={`flex-row items-center border-2 rounded-2xl px-5 py-4 ${
          error
            ? "border-red-400 bg-red-50/50"
            : isFocused
              ? "border-orange-500 bg-orange-50/30 shadow-sm"
              : "border-gray-200 bg-white shadow-sm"
        } transition-all duration-300`}
        style={{
          shadowColor: isFocused ? "#FB923C" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isFocused ? 0.1 : 0.05,
          shadowRadius: 8,
          elevation: isFocused ? 4 : 2,
        }}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 10,
            marginRight: 12,
          }}
        >
          <Ionicons
            name={icon}
            size={22}
            color={error ? "#EF4444" : isFocused ? "#EA580C" : "#9CA3AF"}
          />
        </View>
        <View className="flex-1">
          <Text
            className={`text-xs mb-1 font-semibold ${
              error
                ? "text-red-500"
                : isFocused
                  ? "text-orange-600"
                  : "text-gray-500"
            }`}
          >
            {label}
          </Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`Nhập ${label.toLowerCase()}`}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            editable={editable}
            secureTextEntry={secureTextEntry}
            className={`text-base font-medium ${
              editable ? "text-gray-800" : "text-gray-400"
            }`}
            style={{ minHeight: multiline ? 60 : 24 }}
          />
        </View>
      </View>
      {error && (
        <View className="flex-row items-center mt-1 ml-2">
          <Ionicons name="warning" size={16} color="#EF4444" />
          <Text className="text-red-500 text-sm ml-2 font-medium">
            {error.message}
          </Text>
        </View>
      )}
    </View>
  );
};

export default function UpdateProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { hoTen: "", email: "", sdt: "", diaChi: "" },
  });

  // Load user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsInitialLoading(true);
      try {
        const currentUser = await NguoiDungServices.getCurrentUser();
        if (currentUser) {
          setUserData(currentUser);
          setImageUri(
            Array.isArray(currentUser.anhNguoiDung)
              ? getImageUrl(currentUser.anhNguoiDung[0]) || null
              : getImageUrl(currentUser.anhNguoiDung) || null
          );

          // Reset form with fetched data
          reset({
            hoTen: currentUser.hoTen || "",
            email: currentUser.email || "",
            sdt: currentUser.sdt || "",
            diaChi: currentUser.diaChi || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể tải thông tin người dùng",
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchUserData();
  }, [reset]);

  // Show image picker options
  const showImagePickerOptions = () => {
    Alert.alert(
      "Chọn ảnh đại diện",
      "Bạn muốn chọn ảnh từ đâu?",
      [
        {
          text: "Thư viện",
          onPress: () => handleImagePicker("library"),
          style: "default",
        },
        {
          text: "Máy ảnh",
          onPress: () => handleImagePicker("camera"),
          style: "default",
        },
        {
          text: "Hủy",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  // Handle image picker for both camera and library
  const handleImagePicker = async (source: "camera" | "library") => {
    try {
      let permission;

      if (source === "camera") {
        permission = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: "Quyền truy cập bị từ chối",
          text2: `Cần cấp quyền truy cập ${source === "camera" ? "máy ảnh" : "thư viện ảnh"}`,
        });
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        // Immediately show the selected image
        setImageUri(selectedImage.uri);
        await uploadImage(selectedImage.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể chọn ảnh",
      });
    }
  };

  // Upload image to server
  const uploadImage = async (uri: string) => {
    if (!userData?.maNguoiDung) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      const filename = `profile_${userData.maNguoiDung}_${Date.now()}.jpg`;

      formData.append("images", {
        uri: uri,
        type: "image/jpeg",
        name: filename,
      } as any);

      const response = await request.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 seconds timeout
      });

      const imageUrl = response.data?.imageUrls?.[0];
      if (imageUrl) {
        // Update user profile with new image
        await NguoiDungServices.update({
          maNguoiDung: userData.maNguoiDung,
          anhNguoiDung: imageUrl,
        });

        // Update the display image URL immediately after successful upload
        const fullImageUrl = getImageUrl(imageUrl);
        setImageUri(fullImageUrl || null);

        // Refresh user data to get updated info
        const updatedUser = await NguoiDungServices.getCurrentUser();
        if (updatedUser) {
          setUserData(updatedUser);
        }

        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Cập nhật ảnh đại diện thành công",
        });

        // Mark form as dirty to enable save button for other changes
        // This ensures the user can still save other profile changes if needed
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải ảnh lên. Vui lòng thử lại.",
      });
      // Revert image URI on error to original image
      const originalImageUri = userData?.anhNguoiDung
        ? Array.isArray(userData.anhNguoiDung)
          ? getImageUrl(userData.anhNguoiDung[0]) || null
          : getImageUrl(userData.anhNguoiDung) || null
        : null;
      setImageUri(originalImageUri);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit form data
  const onSubmit = async (data: ProfileFormData) => {
    if (!userData?.maNguoiDung) return;

    setIsLoading(true);
    try {
      // Update user profile
      await NguoiDungServices.update({
        maNguoiDung: userData.maNguoiDung,
        ...data,
      });

      // Fetch updated user data to reflect changes immediately
      const updatedUser = await NguoiDungServices.getCurrentUser();
      if (updatedUser) {
        setUserData(updatedUser);

        // Update form with new data to prevent data loss
        reset({
          hoTen: updatedUser.hoTen || "",
          email: updatedUser.email || "",
          sdt: updatedUser.sdt || "",
          diaChi: updatedUser.diaChi || "",
        });
      }

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Cập nhật thông tin thành công",
      });

      // Navigate back with a small delay to show success message
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Cập nhật thông tin thất bại. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#EA580C" }}>
        <StatusBar barStyle="light-content" backgroundColor="#EA580C" />

        {/* Header */}
        <LinearGradient
          colors={["#EA580C", "#FB923C", "#FED7AA"]}
          className="rounded-b-[32px]"
          style={{ height: 300, paddingTop: 40, paddingHorizontal: 24 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View className="flex-row items-center px-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-18 h-18 items-center justify-center rounded-full bg-white/20 active:bg-white/30"
            >
              <Ionicons name="arrow-back" size={48} color="white" />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-white text-xl font-bold tracking-wide">
              Chỉnh sửa hồ sơ
            </Text>
            <View className="w-12" />
          </View>
        </LinearGradient>

        <View className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#EA580C" />
          <Text className="text-gray-500 mt-4 text-lg">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#EA580C" />

      {/* Enhanced Header with gradient */}
      <LinearGradient
        colors={["#EA580C", "#FB923C", "#FED7AA"]}
        className="pt-8 pb-10 rounded-b-[32px] "
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          shadowColor: "#EA580C",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center px-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 items-center justify-center rounded-full bg-white/20 active:bg-white/30 transition-all duration-200"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-white text-xl font-bold tracking-wide">
            Chỉnh sửa hồ sơ
          </Text>
          <View className="w-12" />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-gray-50"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Avatar Section */}
          <View
            className="items-center mt-8 mb-8 px-6"
            style={{ marginBottom: 16, marginTop: 16 }}
          >
            <View className="relative">
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 72,
                  backgroundColor: "white",
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                {userData?.anhNguoiDung && (
                  <Image
                    source={{
                      uri: Array.isArray(userData.anhNguoiDung)
                        ? getImageUrl(userData.anhNguoiDung[0]) || undefined
                        : getImageUrl(userData.anhNguoiDung) || undefined,
                    }}
                    style={{
                      width: "100%", // ảnh full khung
                      height: "100%",
                    }}
                    resizeMode="cover"
                  />
                )}

                {/* Loading overlay for image upload */}
                {isUploading && (
                  <View
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 72,
                    }}
                  >
                    <ActivityIndicator size="large" color="white" />
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        marginTop: 8,
                        fontWeight: "500",
                      }}
                    >
                      Đang tải...
                    </Text>
                  </View>
                )}
              </View>

              {/* Enhanced Camera Button */}
              <TouchableOpacity
                onPress={showImagePickerOptions}
                disabled={isUploading}
                style={[
                  {
                    position: "absolute",
                    bottom: 0,
                    right: 8,
                    width: 32,
                    height: 32,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#EA580C",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  },
                  { backgroundColor: isUploading ? "#9CA3AF" : "#F97316" },
                ]}
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* User name display */}
            <Text
              className=" text-lg font-bold mt-4"
              style={{ color: "#EA580C" }}
            >
              {userData?.hoTen || "Người dùng"}
            </Text>
            <Text className="text-gray-500 text-sm">
              {userData?.email || "email@example.com"}
            </Text>
          </View>

          {/* Enhanced Form */}
          <View className="mx-6">
            <View
              className="bg-black rounded-3xl p-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Controller
                control={control}
                name="hoTen"
                render={({ field: { onChange, value } }) => (
                  <FloatingInput
                    label="Họ và tên"
                    value={value}
                    onChangeText={onChange}
                    error={errors.hoTen}
                    icon="person-outline"
                    editable={!isLoading}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <FloatingInput
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    error={errors.email}
                    icon="mail-outline"
                    keyboardType="email-address"
                    editable={!isLoading}
                  />
                )}
              />

              <Controller
                control={control}
                name="sdt"
                render={({ field: { onChange, value } }) => (
                  <FloatingInput
                    label="Số điện thoại"
                    value={value}
                    onChangeText={onChange}
                    error={errors.sdt}
                    icon="call-outline"
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
                )}
              />

              <Controller
                control={control}
                name="diaChi"
                render={({ field: { onChange, value } }) => (
                  <FloatingInput
                    label="Địa chỉ"
                    value={value || ""}
                    onChangeText={onChange}
                    error={errors.diaChi}
                    icon="location-outline"
                    multiline
                    editable={!isLoading}
                  />
                )}
              />
            </View>
          </View>

          {/* Enhanced Action Buttons */}
          <View className="mx-6 mt-8">
            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading || isUploading || !isDirty}
              className={`rounded-2xl overflow-hidden mb-4 ${
                isLoading || isUploading || !isDirty
                  ? "opacity-50"
                  : "active:scale-95"
              }`}
              style={{
                shadowColor: "#EA580C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <LinearGradient
                colors={["#FB923C", "#EA580C"]}
                className="py-5 items-center flex-row justify-center"
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold text-lg ml-3">
                      Đang cập nhật...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Lưu thay đổi
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
