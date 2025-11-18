import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import * as Location from "expo-location";
import { AuthContext } from "@/context/AuthContext"; 

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

interface ScheduleData {
  _id: string;
  scheduled_collection: string;
  truck: {
    status: string;
    _id: string;
  };
  route: {
    merge_barangay: Array<{
      barangay_id: string;
    }>;
  };
}

interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  schedules: ScheduleData[];
  getCurrentLocation: () => Promise<LocationData | null>;
  sendLocation: (locationData: LocationData) => void;
  connectWebSocket: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ 
  children 
}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  
  const ws = useRef<WebSocket | null>(null);
  const locationSubscriber = useRef<Location.LocationSubscription | null>(null);
  const { user } = useContext(AuthContext)!;

  // WebSocket connection
  useEffect(() => {
    // connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Continuous location tracking
  useEffect(() => {
    startLocationTracking();

    return () => {
      if (locationSubscriber.current) {
        locationSubscriber.current.remove();
        locationSubscriber.current = null;
      }
    };
  }, []);

  const startLocationTracking = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // Start watching position continuously
      locationSubscriber.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
          timeInterval: 1000
        },
        (currentLocation) => {
          const locationData: LocationData = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            accuracy: currentLocation.coords.accuracy || 0,
            timestamp: currentLocation.timestamp,
          };

          setLocation(locationData);
          sendLocation(locationData);
        }
      );

    } catch (error) {
      console.error('Error starting location tracking:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    try {
      ws.current = new WebSocket("wss://waste-wise-backend-uzub.onrender.com");

      ws.current.onopen = () => {
        console.log('WebSocket connected successfully');
      };

      ws.current.onmessage = (event) => {
        try {
          // First, check if the data is actually JSON
          const data = event.data;
          
          // Check if it's a string that might be "open" or other non-JSON messages
          if (typeof data === 'string') {
            // Try to parse as JSON, but handle non-JSON strings gracefully
            if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
              // It looks like JSON, try to parse it
              const message = JSON.parse(data);
              handleWebSocketMessage(message);
            } else {
              // It's a non-JSON string (like "open", "connected", etc.)
              console.log('WebSocket non-JSON message:', data);
              // Handle connection status messages if needed
              if (data.toLowerCase().includes('open') || data.toLowerCase().includes('connected')) {
                console.log('WebSocket connection confirmed');
              }
            }
          } else {
            console.log('WebSocket received non-string data:', data);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
          console.log("Raw WebSocket data:", event.data);
        }
      };

      ws.current.onerror = (error) => {
        // console.error('WebSocket error:', error);
        // console.error('WebSocket error: TEST');
        console.log('WebSocket error: TEST');
        setError('WebSocket connection error');
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        // Optional: Implement reconnection logic here
        // setTimeout(() => {
        //   console.log('Attempting to reconnect WebSocket...');
        //   connectWebSocket();
        // }, 5000);
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setError('Failed to connect to WebSocket');
    }
  };

  const handleWebSocketMessage = (message: any) => {
    try {
      switch (message.name) {
        case "trucks":
          console.log("Received trucks data:", message.data);

          const onRouteTrucks = message.data.filter((schedule: ScheduleData) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const scheduleDate = new Date(schedule.scheduled_collection);
            scheduleDate.setHours(0, 0, 0, 0);

            return (
              scheduleDate.getTime() === today.getTime() &&
              schedule.truck?.status === "On Route" &&
              schedule.route.merge_barangay.some(
                (barangay: any) =>
                  barangay.barangay_id.toString() === user?.barangay?._id
              )
            );
          });

          const list = user?.role !== "resident" ? message.data : onRouteTrucks;
          setSchedules(list);
          break;
        default:
          console.log("Unknown WebSocket message type:", message.name);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  };

  // Send location via WebSocket
  const sendLocation = (locationData: LocationData) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        const message = JSON.stringify({
          type: 'LOCATION_UPDATE',
          data: locationData,
          userId: user?._id,
          timestamp: Date.now()
        });
        ws.current.send(message);
        console.log('Location sent via WebSocket:', locationData);
      } catch (error) {
        console.error('Error sending location via WebSocket:', error);
      }
    } else {
      console.warn('WebSocket not connected, cannot send location');
      // Optionally try to reconnect
      // connectWebSocket();
    }
  };

  // Get single location
  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy || 0,
        timestamp: currentLocation.timestamp,
      };

      setLocation(locationData);
      sendLocation(locationData);

      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      setError((error as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value: LocationContextType = {
    location,
    loading,
    error,
    schedules,
    connectWebSocket,
    getCurrentLocation,
    sendLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};