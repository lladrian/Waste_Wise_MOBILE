import * as API from '../services/api_service'; // or axios if used directly


export const getAllDataDashboardCollector = async (user_id : string) => {
  try {
    const res = await API.getAllCollectorReport(user_id);
    const res2 = await API.getAllScheduleSpecificUser(user_id);


    return { data: { collector_reports: res.data, schedules: res2.data }, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const getAllDataDashboardResident = async (user_id : string, barangay_id: string) => {
  try {
    const res = await API.getAllGarbageReport(user_id);
    const res2 = await API.getAllScheduleSpecifcBarangay(barangay_id);


    return { data: { garbage_reports: res.data, schedules: res2.data }, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const getAllDataDashboardGuest = async () => {
  try {
    const res = await API.getAllSchedule();


    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

