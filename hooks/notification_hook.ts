import * as API from '../services/api_service'; // or axios if used directly


export interface createNotification{
  user_id : string;
  recurring_day : string;
}

export const createNotificationSpecificUserCollector = async (data : createNotification) => {
  try {
    const res = await API.createNotificationSpecificUserCollector(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const createNotificationSpecificUserResident = async (data : createNotification) => {
  try {
    const res = await API.createNotificationSpecificUserResident(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const getAllNotificationSpecificUser = async (user_id : string, role : string) => {
  try {
    const res = await API.getAllNotificationSpecificUser(user_id, role);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const updateReadAllNotificationSpecificUser = async (user_id : string) => {
  try {
    const res = await API.updateReadAllNotificationSpecificUser(user_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const updateReadSpecificNotification = async (id : string) => {
  try {
    const res = await API.updateReadSpecificNotification(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};