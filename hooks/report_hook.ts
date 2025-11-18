import * as API from '../services/api_service'; // or axios if used directly

export interface createGarbageReportPayload {
  user : string;
  latitude : string;
  longitude : string;
  garbage_type : string;
  report_type : string;
  notes?: string | undefined;
}

export interface createCollectorReportPayload {
  user : string;
  truck : string;
  latitude : string;
  longitude : string;
  report_type : string;
  specific_issue : string;
  notes?: string | undefined;
}


export const createCollectorReport = async (data : createCollectorReportPayload) => {
  try {
    const res = await API.createCollectorReport(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const createGarbageReport = async (data : createGarbageReportPayload) => {
  try {
    const res = await API.createGarbageReport(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const getAllGarbageReport = async (user_id : string) => {
  try {
    const res = await API.getAllGarbageReport(user_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const getAllCollectorReport = async (user_id : string) => {
  try {
    const res = await API.getAllCollectorReport(user_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};





