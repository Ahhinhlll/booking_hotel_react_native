import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export interface TokenInfo {
  token: string | null;
  isValid: boolean;
  needsRefresh: boolean;
}

/**
 * Kiểm tra token có hợp lệ không
 */
export const checkTokenValidity = async (): Promise<TokenInfo> => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      return {
        token: null,
        isValid: false,
        needsRefresh: true
      };
    }

    // Kiểm tra format token (JWT có 3 phần được phân cách bởi dấu chấm)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn('⚠️ Invalid token format');
      return {
        token,
        isValid: false,
        needsRefresh: true
      };
    }

    // Kiểm tra token có hết hạn không
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.warn('⚠️ Token expired');
        return {
          token,
          isValid: false,
          needsRefresh: true
        };
      }

      return {
        token,
        isValid: true,
        needsRefresh: false
      };
    } catch (error) {
      console.warn('⚠️ Error parsing token payload:', error);
      return {
        token,
        isValid: false,
        needsRefresh: true
      };
    }
  } catch (error) {
    console.error('❌ Error checking token validity:', error);
    return {
      token: null,
      isValid: false,
      needsRefresh: true
    };
  }
};

/**
 * Xóa token và redirect về trang login
 */
export const clearTokenAndRedirect = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userInfo');
    console.log('✅ Token cleared');
    
    // Redirect về trang login
    router.push('/auth/login');
  } catch (error) {
    console.error('❌ Error clearing token:', error);
  }
};

/**
 * Kiểm tra token trước khi gọi API (không tự động redirect)
 */
export const validateTokenBeforeRequest = async (): Promise<boolean> => {
  const tokenInfo = await checkTokenValidity();
  
  if (!tokenInfo.isValid) {
    console.warn('⚠️ Token is invalid');
    return false;
  }
  
  return true;
};

/**
 * Kiểm tra và xử lý token trước khi gọi API (có tự động redirect)
 */
export const validateTokenAndRedirect = async (): Promise<boolean> => {
  const tokenInfo = await checkTokenValidity();
  
  if (!tokenInfo.isValid) {
    console.warn('⚠️ Token is invalid, redirecting to login');
    await clearTokenAndRedirect();
    return false;
  }
  
  return true;
};

/**
 * Lấy thông tin user từ token
 */
export const getUserInfoFromToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return null;

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return null;

    const payload = JSON.parse(atob(tokenParts[1]));
    return payload;
  } catch (error) {
    console.error('❌ Error getting user info from token:', error);
    return null;
  }
};
