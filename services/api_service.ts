import axios from "./axios_instance";

export interface LoginPayload {
  email: string;
  password: string;
  device: string;
  platform: string;
  os: string;
}


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

export interface VerifyPayload {
  verify: boolean;
  email: string;
  device: string;
  platform: string;
  os: string;
}

export interface OTPPayload {
  otp_type: string;
  email: string;
  otp: string;
}
export interface CreateOTPPayload {
  otp_type: string;
  email: string;
}

export interface changePasswordRecoveryPayload {
  password: string;
  email: string;
}

export interface changeResidentGarbageSitePayload {
  garbage_site : string;
}

export interface createGarbageReportPayload {
  user : string;
  latitude : string;
  longitude : string;
  garbage_type : string;
  notes?: string;
  report_type : string;
}


export interface createGarbageReportPayloadGuest {
  latitude?: number;
  longitude?: number;
  garbage_type : string;
  notes?: string;
  report_type : string;
}



export interface updateUserProfilePayload {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  contact_number: string;
  email: string;
}

export interface createCollectorReportPayload {
  user : string;
  truck : string;
  latitude : string;
  longitude : string;
  report_type : string;
  specific_issue : string;
  notes?: string;
}


export interface updateAttendanceTimeOutPayload {
  ended_at : string;
  task: any;
  schedule_id: string;
}


export interface createAttendanceTimeInPayload {
  truck : string;
  user : string;
  schedule : string;
  started_at : string;
}

export interface updateTruckStatusPayload {
  status : string;
}

export interface updateCollectionStatusPayload {
  task_updates: {
    task_id: string;
    status: string;
  }[];
}


export interface createNotification{
  user_id : string;
  recurring_day : string;
}

export const createNotificationSpecificUserResident = (data: createNotification) => axios.post(`/notifications/create_notification_resident`, data);
export const createNotificationSpecificUserCollector = (data: createNotification) => axios.post(`/notifications/create_notification_garbage_collector`, data);
export const updateReadAllNotificationSpecificUser = (id: string) => axios.get(`/notifications/update_read_all_notification_specific_user/${id}`);
export const updateReadSpecificNotification = (id: string) => axios.get(`/notifications/update_read_specific_notification/${id}`);
export const getAllNotificationSpecificUser = (id: string, role: string) => axios.get(`/notifications/get_all_notification_specific_user/${id}/${role}`);
export const updateScheduleCollectionStatus = (id: string, data: updateCollectionStatusPayload) => axios.put(`/schedules/update_schedule_garbage_collection_status/${id}`, data);
export const getAllLoginLogSpecificUser = (id: string) => axios.get(`/logs/get_all_login_log_specific_user/${id}`);
export const checkAttendanceSpecificUser = (id: string) => axios.get(`/collector_attendances/check_collector_attendance/${id}`);
export const createAttendanceTimeIn = (data: createAttendanceTimeInPayload) => axios.post(`/collector_attendances/add_collector_attendance`, data);
export const updateAttendanceTimeOut = (id: string, data: updateAttendanceTimeOutPayload) => axios.put(`/collector_attendances/update_collector_attendance_time_out/${id}`, data);
export const getAllAttendanceSpecificUser = (id: string) => axios.get(`/collector_attendances/get_all_collector_attendance_specific_user/${id}`);
export const getAllAttendance = () => axios.get(`/collector_attendances/get_all_collector_attendance`);
export const updateUserProfile = (id: string, data: updateUserProfilePayload) => axios.put(`/users/update_user_profile/${id}`, data);
export const getAllSchedule = () => axios.get(`/schedules/get_all_schedule`);
export const getAllScheduleSpecifcBarangay = (id: string) => axios.get(`/schedules/get_all_schedule_specific_barangay/${id}`);
export const getAllScheduleSpecificUser = (id: string) => axios.get(`/schedules/get_all_schedule_specific_user_garbage_collector/${id}`);
export const getTodayScheduleSpecificUser = (id: string) => axios.get(`/schedules/get_all_schedule_current_day_specific_user/${id}`);
export const getAllGarbageReport = () => axios.get(`/garbage_reports/get_all_garbage_report`);
export const getAllGarbageReportSpecificUser = (id: string) => axios.get(`/garbage_reports/get_all_garbage_report_specific_user/${id}`);
export const getAllCollectorReport = (id: string) => axios.get(`/collector_reports/get_all_collector_report_specific_user/${id}`);
export const getAllBarangay = () => axios.get(`/barangays/get_all_barangay`);
export const getAllGarbageSiteSpecificBarangay = (id: string | undefined) => axios.get(`/garbage_sites/get_all_garbage_site_specific_barangay/${id}`);
export const getSpecificUser = (id: string) => axios.get(`/users/get_specific_user/${id}`);
export const loginUser = (data: LoginPayload) => axios.post("/users/login_user_mobile", data);
export const changeUserResidentGarbageSite = (id: string, data: changeResidentGarbageSitePayload) => axios.put(`/users/update_user_resident_garbage_site/${id}`, data);
export const createUser = (data: RegisterPayload) => axios.post(`/users/add_user_resident`, data);
export const verifyUser = (data: VerifyPayload) => axios.post(`/users/update_user_verified_email`, data);
export const verifyOTP = (data: OTPPayload) => axios.post('/otp/verify_otp', data);
export const createOTP = (data: CreateOTPPayload) => axios.post('/otp/add_otp', data);
export const changePasswordRecovery = (data: changePasswordRecoveryPayload) => axios.put('/users/update_user_password_recovery', data);
export const createGarbageReport = (data: createGarbageReportPayload) => axios.post('/garbage_reports/add_garbage_report', data);
export const createGarbageReportGuest = (data: createGarbageReportPayloadGuest) => axios.post('/garbage_reports/add_garbage_report_guest', data);
export const createCollectorReport = (data: createCollectorReportPayload) => axios.post('/collector_reports/add_collector_report', data);
export const updateTruckStatus = (id: string, data: updateTruckStatusPayload) => axios.put(`/trucks/update_truck_status/${id}`, data);
export const getAllTruckSpecificUser = (id: string) => axios.get(`/trucks/get_all_truck_specific_user/${id}`);

