import * as API from '../services/api_service'; // or axios if used directly


export const getSpecificUser = async (user_id: string) => {
  try {
    const res = await API.getSpecificUser(user_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};