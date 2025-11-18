import * as API from '../services/api_service'; // or axios if used directly

export interface RegisterPayload {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  contact_number: string;
  password: string;
  email: string;
  role: string;
  barangay: string;
}


export const createUser = async (data : RegisterPayload) => {
  try {
    const res = await API.createUser(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const getAllBarangay = async () => {
  try {
    const res = await API.getAllBarangay();

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



