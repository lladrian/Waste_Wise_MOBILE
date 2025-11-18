import * as API from '../services/api_service'; // or axios if used directly

export const getAllLoginLogSpecificUser = async (user_id: string) => {
  try {
    const res = await API.getAllLoginLogSpecificUser(user_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};