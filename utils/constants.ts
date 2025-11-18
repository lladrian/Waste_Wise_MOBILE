export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://waste-wise-backend-chi.vercel.app";

export const USER_ROLES = {
  ADMIN: "administrator",
  ENRO_STAFF: "enro_staff",
  BARANGAY_OFFICIAL: "barangay_official",
  GARBAGE_COLLECTOR: "truck_driver",
  RESIDENT: "resident",
} as const;
