// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   Image,
//   ActivityIndicator,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useState } from "react";
// import { useRouter } from "expo-router";
// import Toast from "react-native-toast-message";
// import { AuthService } from "../../services/AuthServices";

// export default function LoginScreen() {
//   const [identifier, setIdentifier] = useState(""); // email hoặc sdt
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState({ identifier: "", password: "" });
//   const router = useRouter();

//   const validateEmail = (email: string) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const validatePhoneNumber = (phone: string) => {
//     const phoneRegex = /^[0-9]{10,11}$/;
//     return phoneRegex.test(phone);
//   };

//   const validateForm = () => {
//     let isValid = true;
//     let newErrors = { identifier: "", password: "" };

//     if (!identifier.trim()) {
//       newErrors.identifier = "Email hoặc số điện thoại không được để trống";
//       isValid = false;
//     } else if (!validateEmail(identifier) && !validatePhoneNumber(identifier)) {
//       newErrors.identifier = "Email hoặc số điện thoại không hợp lệ";
//       isValid = false;
//     }

//     if (!password.trim()) {
//       newErrors.password = "Mật khẩu không được để trống";
//       isValid = false;
//     } else if (password.length < 6) {
//       newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
//       isValid = false;
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleLogin = async () => {
//     if (!validateForm()) {
//       Toast.show({
//         type: "error",
//         text1: "Thông tin không hợp lệ",
//         text2: "Vui lòng kiểm tra lại thông tin đăng nhập",
//         position: "top",
//       });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       console.log("Starting login process...");
//       const result = await AuthService.login(identifier.trim(), password);
//       console.log("Login result:", result);

//       if (result?.success && result?.data?.token) {
//         console.log("Login successful, showing toast...");

//         // Hiển thị thông báo thành công
//         Toast.show({
//           type: "success",
//           text1: "Đăng nhập thành công",
//           text2: `Chào mừng ${result.data.user?.hoTen || "bạn"}`,
//           position: "top",
//           visibilityTime: 1000,
//         });

//         console.log("Attempting to navigate...");
//         // Chuyển trang ngay lập tức
//         setTimeout(() => {
//           console.log("Navigating to tabs...");
//           router.replace("/(tabs)");
//         }, 500);
//       } else {
//         console.log("Login failed:", result);
//         Toast.show({
//           type: "error",
//           text1: "Đăng nhập thất bại",
//           text2: result?.message || "Sai tài khoản hoặc mật khẩu",
//           position: "top",
//         });
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       Toast.show({
//         type: "error",
//         text1: "Lỗi kết nối server",
//         text2: "Vui lòng thử lại sau!",
//         position: "top",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const navigateToRegister = () => {
//     router.push("/auth/register");
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
//       <KeyboardAvoidingView
//         style={{ flex: 1, width: "100%" }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//       >
//         <View style={styles.content}>
//           <View style={styles.header}>
//             <Image
//               source={{
//                 uri: "https://cdn-icons-png.flaticon.com/512/295/295128.png",
//               }}
//               style={styles.logo}
//             />
//             {/*  */}
//             <Text style={styles.title}>Chào mừng trở lại!</Text>
//             <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
//           </View>

//           <View style={styles.inputContainer}>
//             <View
//               style={[
//                 styles.inputWrapper,
//                 errors.identifier && styles.inputError,
//               ]}
//             >
//               <Ionicons
//                 name="person-outline"
//                 size={20}
//                 color="#6b7280"
//                 style={styles.icon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Email hoặc Số điện thoại"
//                 placeholderTextColor="#9ca3af"
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 value={identifier}
//                 onChangeText={(text) => {
//                   setIdentifier(text);
//                   if (errors.identifier)
//                     setErrors({ ...errors, identifier: "" });
//                 }}
//               />
//             </View>
//             {errors.identifier ? (
//               <Text style={styles.errorText}>{errors.identifier}</Text>
//             ) : null}

//             <View
//               style={[
//                 styles.inputWrapper,
//                 errors.password && styles.inputError,
//               ]}
//             >
//               <Ionicons
//                 name="lock-closed-outline"
//                 size={20}
//                 color="#6b7280"
//                 style={styles.icon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Mật khẩu"
//                 placeholderTextColor="#9ca3af"
//                 secureTextEntry={!showPassword}
//                 value={password}
//                 onChangeText={(text) => {
//                   setPassword(text);
//                   if (errors.password) setErrors({ ...errors, password: "" });
//                 }}
//               />
//               <TouchableOpacity
//                 style={styles.passwordToggle}
//                 onPress={() => setShowPassword(!showPassword)}
//               >
//                 <Ionicons
//                   name={showPassword ? "eye-off-outline" : "eye-outline"}
//                   size={20}
//                   color="#9ca3af"
//                 />
//               </TouchableOpacity>
//             </View>
//             {errors.password ? (
//               <Text style={styles.errorText}>{errors.password}</Text>
//             ) : null}

//             <TouchableOpacity
//               style={styles.forgotPassword}
//               onPress={() =>
//                 Toast.show({
//                   type: "info",
//                   text1: "Tính năng đang phát triển",
//                   text2: "Quên mật khẩu sẽ có sớm!",
//                   position: "top",
//                 })
//               }
//             >
//               <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity
//             style={[styles.loginButton, { opacity: isLoading ? 0.7 : 1 }]}
//             onPress={handleLogin}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <ActivityIndicator color="#fff" size="small" />
//             ) : (
//               <Text style={styles.loginButtonText}>Đăng nhập</Text>
//             )}
//           </TouchableOpacity>

//           <View style={styles.footer}>
//             <Text style={styles.footerText}>Bạn chưa có tài khoản?</Text>
//             <TouchableOpacity onPress={navigateToRegister}>
//               <Text style={styles.registerText}>Đăng ký ngay</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f9fafb", // Light gray background
//     alignItems: "center",
//   },
//   content: {
//     flex: 1,
//     padding: 24,
//     width: "100%",
//     justifyContent: "center",
//   },
//   header: {
//     alignItems: "center",
//     marginBottom: 48,
//   },
//   logo: {
//     width: 96,
//     height: 96,
//     marginBottom: 16,
//     resizeMode: "contain",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "800",
//     color: "#1f2937",
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#6b7280",
//     fontWeight: "500",
//   },
//   inputContainer: {
//     width: "100%",
//     marginBottom: 24,
//   },
//   inputWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 16,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//     height: 52,
//   },
//   inputError: {
//     borderColor: "#ef4444",
//   },
//   icon: {
//     marginRight: 12,
//   },
//   input: {
//     flex: 1,
//     height: "100%",
//     fontSize: 16,
//     color: "#1f2937",
//   },
//   passwordToggle: {
//     padding: 8,
//   },
//   errorText: {
//     fontSize: 13,
//     color: "#ef4444",
//     marginBottom: 12,
//     marginLeft: 16,
//   },
//   forgotPassword: {
//     alignSelf: "flex-end",
//   },
//   forgotPasswordText: {
//     fontSize: 14,
//     color: "#FB923C",
//     fontWeight: "600",
//   },
//   loginButton: {
//     width: "100%",
//     backgroundColor: "#FB923C",
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#FB923C",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   loginButtonText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   footer: {
//     flexDirection: "row",
//     marginTop: 24,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   footerText: {
//     fontSize: 14,
//     color: "#6b7280",
//   },
//   registerText: {
//     fontSize: 14,
//     color: "#fb923c",
//     fontWeight: "bold",
//     marginLeft: 6,
//   },
// });
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Đảm bảo Ionicons đã được import
import { useState } from "react";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthService } from "../../services/AuthServices";

// // Import local image logo (đã sửa ở bước trước)
// import logo from "";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState(""); // email hoặc sdt
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ identifier: "", password: "" });
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = { identifier: "", password: "" };

    if (!identifier.trim()) {
      newErrors.identifier = "Email hoặc số điện thoại không được để trống";
      isValid = false;
    } else if (!validateEmail(identifier) && !validatePhoneNumber(identifier)) {
      newErrors.identifier = "Email hoặc số điện thoại không hợp lệ";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Mật khẩu không được để trống";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: "Thông tin không hợp lệ",
        text2: "Vui lòng kiểm tra lại thông tin đăng nhập",
        position: "top",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Starting login process...");
      const result = await AuthService.login(identifier.trim(), password);
      console.log("Login result:", result);

      if (result?.success && result?.data?.token) {
        console.log("Login successful, showing toast...");

        // Hiển thị thông báo thành công
        Toast.show({
          type: "success",
          text1: "Đăng nhập thành công",
          text2: `Chào mừng ${result.data.user?.hoTen || "bạn"}`,
          position: "top",
          visibilityTime: 1000,
        });

        console.log("Attempting to navigate...");
        // Chuyển trang ngay lập tức
        setTimeout(() => {
          console.log("Navigating to tabs...");
          router.replace("/(tabs)");
        }, 500);
      } else {
        console.log("Login failed:", result);
        Toast.show({
          type: "error",
          text1: "Đăng nhập thất bại",
          text2: result?.message || "Sai tài khoản hoặc mật khẩu",
          position: "top",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi kết nối server",
        text2: "Vui lòng thử lại sau!",
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push("/auth/register");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/logomeomeo.jpg")}
              style={styles.logo}
            />

            <Text style={styles.title}>Chào mừng trở lại!</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
          </View>

          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                errors.identifier && styles.inputError,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color="#6b7280"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email hoặc Số điện thoại"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={identifier}
                onChangeText={(text) => {
                  setIdentifier(text);
                  if (errors.identifier)
                    setErrors({ ...errors, identifier: "" });
                }}
              />
            </View>
            {errors.identifier ? (
              <Text style={styles.errorText}>{errors.identifier}</Text>
            ) : null}

            <View
              style={[
                styles.inputWrapper,
                errors.password && styles.inputError,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#6b7280"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() =>
                Toast.show({
                  type: "info",
                  text1: "Tính năng đang phát triển",
                  text2: "Quên mật khẩu sẽ có sớm!",
                  position: "top",
                })
              }
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* New section for social icons */}
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>Hoặc</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            {/* Google Icon */}
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </TouchableOpacity>

            {/* Github Icon */}
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-github" size={24} color="#333" />
            </TouchableOpacity>

            {/* Twitter Icon */}
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
            </TouchableOpacity>

            {/* Facebook Icon */}
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Bạn chưa có tài khoản?</Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerText}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb", // Light gray background
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 24,
    width: "100%",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 16,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    height: 52,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#1f2937",
  },
  passwordToggle: {
    padding: 8,
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
    marginBottom: 12,
    marginLeft: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#FB923C",
    fontWeight: "600",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#FB923C", // Main orange color
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FB923C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  // New styles for social icons
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
    width: "100%",
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  orText: {
    width: 50,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25, // Make it a perfect circle
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  footer: {
    flexDirection: "row",
    marginTop: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  registerText: {
    fontSize: 14,
    color: "#fb923c",
    fontWeight: "bold",
    marginLeft: 6,
  },
});
