import * as API from '../services/api_service'; // or axios if used directly

export interface OTPPayload {
  otp_type: string;
  email: string;
  otp: string;
}

export interface VerifyPayload {
  verify: boolean;
  email: string;
  device: string;
  platform: string;
  os: string;
}

export interface CreateOTPPayload {
  otp_type: string;
  email: string;
}

export const createOTP = async (data : CreateOTPPayload) => {
  try {
    const res = await API.createOTP(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const verifyOTP = async (data : OTPPayload) => {
  try {
    const res = await API.verifyOTP(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const verifyUser = async (data : VerifyPayload) => {
  try {
    const res = await API.verifyUser(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


