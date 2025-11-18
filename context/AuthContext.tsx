import CryptoJS from "crypto-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "expo-router";


const SECRET_KEY = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16 bytes
const IV = CryptoJS.enc.Utf8.parse('6543210987654321'); // 16 bytes

export interface Barangay {
  _id: string;
  barangay_name: string;
  created_at: string;
  [key: string]: any;
}

export interface GarbageSite {
  _id: string;
  garbage_site_name: string;
  created_at: string;
  [key: string]: any;
}

export interface User {
  _id: string;
  email: string;
  role: string;
  barangay?: Barangay;
  garbage_site?: GarbageSite;
  is_verified: boolean; // ✅ use boolean
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, loginDate: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (data: User) => Promise<void>;
  loading: boolean; // ✅ Added loading state
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  const encryptData = (data: any) => {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      SECRET_KEY,
      { iv: IV, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    return encrypted.toString();
  };
  
  const decryptData = (cipher: string) => {
    try {
      const decrypted = CryptoJS.AES.decrypt(cipher, SECRET_KEY, {
        iv: IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch {
      return null;
    }
  };
  const parseCustomDate = (dateString: string): Date | null => {
    try {
      const [d, t] = dateString.split(" ");
      const [y, m, day] = d.split("-").map(Number);
      const [h, min, s] = t.split(":").map(Number);
      return new Date(y, m - 1, day, h, min, s);
    } catch {
      return null;
    }
  };

  const fetchAuthData = async () => {
    try {
      const userEnc = await AsyncStorage.getItem("user_data");
      const timeEnc = await AsyncStorage.getItem("logged_in_at");

      if (!userEnc || !timeEnc) return logout();

      const userData = decryptData(userEnc);
      const dateStr = decryptData(timeEnc);

      const loginDate = parseCustomDate(dateStr);
      if (!userData || !loginDate) return logout();

      const expiry = loginDate.getTime() + 30 * 60 * 1000;
      if (Date.now() > expiry) return logout();

      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthData();
  }, []);

  const login = async (userData: User, loginDate: string) => {
    setUser(userData);
    await AsyncStorage.setItem("user_data", encryptData(userData));
    await AsyncStorage.setItem("logged_in_at", encryptData(loginDate));
  };

  const updateProfile = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem("user_data", encryptData(userData));
  };

  const logout = async () => {
    console.log("logout12");
    setUser(null);
    await AsyncStorage.clear();
    router.replace("/auth/login");
    return;
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, refresh: fetchAuthData, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};