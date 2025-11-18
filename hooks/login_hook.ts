import * as API from '../services/api_service'; // or axios if used directly

export interface LoginPayload {
  email: string;
  password: string;
  device: string;
  platform: string;
  os: string;
}

export const loginUser = async (data : LoginPayload) => {
  try {
    const res = await API.loginUser(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

