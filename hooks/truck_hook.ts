import * as API from '../services/api_service'; // or axios if used directly


export interface updateTruckStatusPayload {
  status : string;
}


export const updateTruckStatus = async (user_id: string, data : updateTruckStatusPayload) => {
  try {
    const res = await API.updateTruckStatus(user_id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const getAllTruckSpecificUser = async (user_id: string) => {
  try {
    const res = await API.getAllTruckSpecificUser(user_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



