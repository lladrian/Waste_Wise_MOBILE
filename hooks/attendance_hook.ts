import * as API from '../services/api_service'; // or axios if used directly

export interface createAttendanceTimeInPayload {
  truck : string;
  user : string;
  schedule : string;
  started_at : string;
}

export interface updateAttendanceTimeOutPayload {
  ended_at : string;
}


export const checkAttendanceSpecificUser = async (user_id: string) => {
  try {
    const res = await API.checkAttendanceSpecificUser(user_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const getAllAttendanceSpecificUser = async (user_id: string) => {
  try {
    const res = await API.getAllAttendanceSpecificUser(user_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const createAttendanceTimeIn = async (data: createAttendanceTimeInPayload) => {
  try {
    const res = await API.createAttendanceTimeIn(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const updateAttendanceTimeOut = async (user_id: string, data : updateAttendanceTimeOutPayload) => {
  try {
    const res = await API.updateAttendanceTimeOut(user_id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



