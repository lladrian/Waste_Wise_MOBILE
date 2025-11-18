import * as API from '../services/api_service'; // or axios if used directly

export interface LoginPayload {
    email: string;
    password: string;
  }

  export interface changeResidentGarbageSitePayload {
    garbage_site : string;
  }

export const getAllGarbageSiteSpecificBarangay = async (barangay_id : string | undefined) => {
  try {
    const res = await API.getAllGarbageSiteSpecificBarangay(barangay_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const changeUserResidentGarbageSite = async (user_id : string, data: changeResidentGarbageSitePayload) => {
  try {
    const res = await API.changeUserResidentGarbageSite(user_id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};