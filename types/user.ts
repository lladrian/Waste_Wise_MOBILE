// types/user.ts
export enum UserRole {
  ADMIN = "administrator",
  ENRO_STAFF = "enro_staff",
  BARANGAY_OFFICIAL = "barangay_official",
  GARBAGE_COLLECTOR = "truck_driver",
  RESIDENT = "resident",
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  barangay?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// types/schedule.ts
export interface CollectionSchedule {
  id: string;
  barangay: string;
  scheduleDate: Date;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  assignedCollector?: string;
  completedAt?: Date;
}

// types/report.ts
export interface Report {
  id: string;
  type: "uncollected" | "missed_area" | "truck_breakdown" | "other";
  description: string;
  location: string;
  barangay: string;
  status: "pending" | "in-progress" | "resolved";
  submittedBy: string;
  createdAt: Date;
  images?: string[];
}
