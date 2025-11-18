import { User } from "@/types";
import api from "./api";

interface LoginResponse {
  token: string;
  user: User;
}

interface SignupResponse {
  message: string;
  email?: string;
  requiresVerification?: boolean;
  user?: User;
  token?: string;
}

interface SignupData {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  contact_number: string;
  password: string;
  email: string;
  barangay: string;
  role: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post("/users/login_user", { email, password });
    return response.data.data;
  },

  async signup(userData: SignupData): Promise<SignupResponse> {
    const response = await api.post("/users/add_user_resident", userData);

    // Transform the response to match SignupResponse
    const responseData = response.data;

    // Return email for OTP verification instead of userId
    return {
      message:
        responseData.message ||
        "Signup successful. Please check your email for verification code.",
      email: userData.email, // Use the email from signup data for OTP
      requiresVerification: responseData.requiresVerification ?? true, // Default to true for OTP verification
      user: responseData.user,
      token: responseData.token,
    };
  },

  async forgotPassword(email: string): Promise<void> {
    const response = await api.post("/users/update_user_password_recovery", {
      email,
    });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await api.post("/users/update_user_password", {
      token,
      newPassword,
    });
    return response.data;
  },
};
