import * as API from '../services/api_service'; // or axios if used directly




export interface updateCollectionStatusPayload {
  task_updates: {
    task_id: string;
    status: string;
  }[];
}


export const updateScheduleCollectionStatus = async (schedule_id  : string, data: updateCollectionStatusPayload) => {
  try {
    const res = await API.updateScheduleCollectionStatus(schedule_id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const getAllScheduleSpecifcBarangay = async (barangay_id  : string) => {
  try {
    const res = await API.getAllScheduleSpecifcBarangay(barangay_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const getTodayScheduleSpecificUser = async (user_id  : string) => {
  try {
    const res = await API.getTodayScheduleSpecificUser(user_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const getAllScheduleSpecificUser = async (user_id  : string) => {
  try {
    const res = await API.getAllScheduleSpecificUser(user_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

