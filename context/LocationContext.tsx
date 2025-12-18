import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import * as Location from 'expo-location';
import { AuthContext } from '@/context/AuthContext';
import { getTodayScheduleSpecificUser } from './../hooks/schedule_hook';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

interface ScheduleData {
  _id: string;
  recurring_day: string;
  truck: { status: string; _id: string };
  route: { merge_barangay: { barangay_id: string }[] };
  [key: string]: any;
}

interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<LocationData | null>;
  sendLocation: (locationData: LocationData) => void;
  connectWebSocket: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const { user } = useContext(AuthContext)!;
  const isGarbageCollector = user?.role === 'garbage_collector';

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const locationSubscriber = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!isGarbageCollector) return;

    connectWebSocket();
    startLocationTracking();

    return () => {
      locationSubscriber.current?.remove();
      ws.current?.close();
    };
  }, []);




  // Helper to get today’s day
  const getTodayDayName = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const philippinesTime = new Date(utc + 8 * 3600000);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[philippinesTime.getDay()].toLowerCase();
  };

 

  const getTodaySchedule = async () => {
    try {
      // setLoading(true);
      const scheduleData = await getTodayScheduleSpecificUser(user?._id || "");

      if (scheduleData?.data?.data?.[0]) {
        const schedule = scheduleData.data.data[0];

        // Return the schedule for further processing
        return schedule;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    } finally {
      // setLoading(false);
    }
  };
  // WebSocket
  const connectWebSocket = () => {
    if (!isGarbageCollector) return;

    ws.current = new WebSocket('wss://waste-wise-backend-uzub.onrender.com');

    ws.current.onopen = () => {
      console.log('WebSocket connected successfully');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = event.data;
        if (typeof data === 'string' && (data.startsWith('{') || data.startsWith('['))) {
          handleWebSocketMessage(JSON.parse(data));
        } else {
          console.log('Non-JSON WS message:', data);
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    ws.current.onerror = (err) => {
      // console.error('WebSocket error:', err);
      setError('WebSocket error');
    };

    ws.current.onclose = () => {
      console.log('WebSocket closed, reconnecting in 5s...');
      setTimeout(connectWebSocket, 5000);
    };
  };

  const handleWebSocketMessage = (message: any) => {
    try {
      if (message.name === 'trucks') {
        const today = getTodayDayName();
        const onRouteTrucks = message.data.filter((s: ScheduleData) =>
          Array.isArray(s.recurring_day) &&
          s.recurring_day.includes(today) &&
          s.truck?.status === 'On Route' &&
          s.route.merge_barangay.some((b) => b.barangay_id === user?.barangay?._id)
        );
        const list = user?.role !== 'resident' ? message.data : onRouteTrucks;
        // setSchedules(list);
      } else {
        console.log('Unknown WS message type:', message.name);
      }
    } catch (err) {
      console.error('Error handling WS message:', err);
    }
  };

  // Send location continuously
  const sendLocation = async (locationData: LocationData | null = null) => {
    if (!isGarbageCollector || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const data_schedule = await getTodaySchedule(); // ✅ Wait for the promise to resolve
    const truckId = data_schedule?.truck?._id; // ✅ Note: data_schedule is the object, not an array
   
    if (!truckId) return; // skip if no truck yet

    const messages = [
      {
        type: 'update_truck_position',
        truck_id: truckId,
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
      },
      {
        type: 'update_collector_attendance_truck_position',
        user_id: user?._id,
        route_status: 'On Route',
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
      },
    ];

    messages.forEach((msg, i) => {
      try {
        ws.current?.send(JSON.stringify(msg));
        console.log(`Message ${i + 1} sent:`, msg.type);
      } catch (err) {
        console.error(`Error sending message ${i + 1}:`, err);
      }
    });
  };

  // Start tracking location continuously
  const startLocationTracking = async () => {
    if (!isGarbageCollector) return;

    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      locationSubscriber.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
          timeInterval: 1000
        },
        async (loc) => { // ✅ Add async here
          const locationData: LocationData = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy || 0,
            timestamp: loc.timestamp,
          };
          setLocation(locationData);

          try {
            if (isGarbageCollector) {
              await sendLocation(locationData); // ✅ Now await works
            }
          } catch (error) {
            console.error("Error sending location:", error);
          }
        }
      );
    } catch (err) {
      console.error('Error tracking location:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const locationData: LocationData = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        // accuracy: loc.coords.accuracy,
        timestamp: loc.timestamp,
      };
      setLocation(locationData);

      if (isGarbageCollector) await sendLocation(locationData);
      return locationData;
    } catch (err) {
      console.error('Error getting location:', err);
      return null;
    }
  };


  return (
    <LocationContext.Provider
      value={{
        location,
        loading,
        error,
        getCurrentLocation,
        sendLocation,
        connectWebSocket,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
