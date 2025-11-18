import * as API from '../services/api_service'; // or axios if used directly

export interface updateUserProfilePayload {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  contact_number: string;
  email: string;
}


export const updateUserProfile = async (id: string, data: updateUserProfilePayload) => {
  try {
    const res = await API.updateUserProfile(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



