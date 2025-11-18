export interface Collector {
  id: string;
  name: string;
  vehicle: string;
  phone: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  status: "active" | "break" | "offline";
  lastUpdated: string;
}

export interface CollectionSchedule {
  id: string;
  day: string;
  time: string;
  type: "regular" | "special" | "bulk";
  status: "scheduled" | "in-progress" | "completed" | "delayed";
  collectorId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "delay" | "reschedule" | "reminder" | "alert";
  date: string;
  read: boolean;
}

export interface Report {
  id: string;
  type: "uncollected" | "missed_area" | "overflowing" | "other";
  description: string;
  location: string;
  urgency: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "resolved" | "cancelled";
  submittedAt: string;
  resolvedAt?: string;
  response?: string;
}

// Static data for demonstration
export const staticCollectors: Collector[] = [
  {
    id: "1",
    name: "Juan Dela Cruz",
    vehicle: "Garbage Truck A (ABC-123)",
    phone: "+639123456789",
    currentLocation: {
      latitude: 10.936,
      longitude: 124.609,
    },
    status: "active",
    lastUpdated: "2024-01-15T08:30:00Z",
  },
  {
    id: "2",
    name: "Pedro Santos",
    vehicle: "Garbage Truck B (XYZ-789)",
    phone: "+639987654321",
    currentLocation: {
      latitude: 10.938,
      longitude: 124.611,
    },
    status: "active",
    lastUpdated: "2024-01-15T08:25:00Z",
  },
];

export const staticSchedule: CollectionSchedule[] = [
  {
    id: "1",
    day: "Monday",
    time: "8:00 AM - 12:00 PM",
    type: "regular",
    status: "scheduled",
    collectorId: "1",
  },
  {
    id: "2",
    day: "Wednesday",
    time: "8:00 AM - 12:00 PM",
    type: "regular",
    status: "scheduled",
    collectorId: "2",
  },
  {
    id: "3",
    day: "Friday",
    time: "8:00 AM - 12:00 PM",
    type: "regular",
    status: "scheduled",
    collectorId: "1",
  },
  {
    id: "4",
    day: "Saturday",
    time: "1:00 PM - 4:00 PM",
    type: "special",
    status: "scheduled",
    collectorId: "2",
  },
];

export const staticNotifications: Notification[] = [
  {
    id: "1",
    title: "Collection Delay",
    message:
      "Garbage collection in your area is delayed by 1 hour due to vehicle maintenance.",
    type: "delay",
    date: "2024-01-15T07:30:00Z",
    read: false,
  },
  {
    id: "2",
    title: "Schedule Change",
    message:
      "Friday collection rescheduled to Thursday this week due to holiday.",
    type: "reschedule",
    date: "2024-01-14T09:00:00Z",
    read: true,
  },
  {
    id: "3",
    title: "Reminder",
    message: "Don't forget to place your bins outside by 7:00 AM tomorrow.",
    type: "reminder",
    date: "2024-01-14T18:00:00Z",
    read: true,
  },
];

export const staticReports: Report[] = [
  {
    id: "1",
    type: "uncollected",
    description: "Garbage not collected from our street today",
    location: "123 Main Street",
    urgency: "high",
    status: "resolved",
    submittedAt: "2024-01-10T14:30:00Z",
    resolvedAt: "2024-01-11T09:15:00Z",
    response:
      "Our team collected the garbage this morning. Sorry for the inconvenience.",
  },
  {
    id: "2",
    type: "overflowing",
    description: "Public bin near the market is overflowing",
    location: "Market Square",
    urgency: "medium",
    status: "in-progress",
    submittedAt: "2024-01-15T08:45:00Z",
  },
  {
    id: "3",
    type: "missed_area",
    description: "Collectors missed our alley behind the main road",
    location: "Alley behind 456 Oak Street",
    urgency: "medium",
    status: "pending",
    submittedAt: "2024-01-15T13:20:00Z",
  },
];

// Mock user data
export const mockUser = {
  id: "user123",
  first_name: "Maria",
  last_name: "Clara",
  barangay: "Barangay 1",
  address: "123 Main Street, Barangay 1",
};
