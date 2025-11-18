import { VerifyOTPRequest, VerifyOTPResponse } from "@/types";
import api from "./api";

export const otpService = {
  // Request OTP for verification (for signup)
  requestOTP: async (
    email: string,
    otpType: "verification" | "recovery" = "verification"
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/otp/add_otp", {
      email,
      otp_type: otpType,
    });
    return response.data;
  },

  // Request OTP for password recovery
  requestRecoveryOTP: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/otp/add_otp", {
      email,
      otp_type: "recovery",
    });
    return response.data;
  },

  // Verify OTP code
  verifyOTP: async (
    verifyData: VerifyOTPRequest
  ): Promise<VerifyOTPResponse> => {
    const response = await api.post<VerifyOTPResponse>(
      "/otp/verify_otp",
      verifyData // Send the data directly since it matches the backend structure
    );
    return response.data;
  },

  // Resend OTP
  resendOTP: async (
    email: string,
    otpType: "verification" | "recovery" = "verification"
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/otp/resend", {
      email,
      otp_type: otpType,
    });
    return response.data;
  },
};
