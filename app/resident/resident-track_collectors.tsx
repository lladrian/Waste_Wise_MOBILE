import {
  Badge,
  BadgeText,
  Box,
  Card,
  HStack,
  ScrollView,
  Text,
  useToast,
  VStack,
} from "@gluestack-ui/themed";
import React, { useEffect, useState, useContext, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import { staticCollectors } from "../../data/staticData";
import { AuthContext } from "@/context/AuthContext";
import { getAllScheduleSpecifcBarangay } from "../../hooks/track_collector_hook";
import { useFocusEffect } from "@react-navigation/native";
import { AppToast } from "@/components/ui/AppToast";
import { TouchableOpacity } from "react-native";

export interface ScheduleData {
  _id: string;
  [key: string]: any;
}

export default function ResidentTrackCollectorsScreen() {
  const toast = useToast();
  const { user } = useContext(AuthContext)!;
  const collectors = staticCollectors;
  const ws = useRef<WebSocket | null>(null);
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket("wss://waste-wise-backend-uzub.onrender.com");

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.name) {
          case "trucks":
            const onRouteTrucks = message.data.filter((schedule: any) => {
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

            const list =
              user?.role !== "resident" ? message.data : onRouteTrucks;
            setSchedules(list);
            break;
          default:
            console.log("Unknown WebSocket message:", message.name);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onopen = () => {
      console.log("WebSocket connected for schedules");
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected for schedules");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchSchedules();
    }, [])
  );

  const fetchSchedules = async () => {
    try {
      const { data, success } = await getAllScheduleSpecifcBarangay(
        user?.barangay?._id || ""
      );
      if (success === true) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const onRouteTrucks = data.data.filter((schedule: any) => {
          const scheduleDate = new Date(schedule.scheduled_collection);
          scheduleDate.setHours(0, 0, 0, 0);

          return (
            scheduleDate.getTime() === today.getTime() &&
            schedule.truck?.status === "On Route" &&
            schedule.route.merge_barangay.some(
              (barangay: any) =>
                barangay.barangay_id._id.toString() === user?.barangay?._id
            )
          );
        });

        const list =
          user?.role !== "resident" ? data.schedules.data : onRouteTrucks;

        setSchedules(list);
      }
    } catch (error) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Error"
            description="Failed to load garbage report."
          />
        ),
      });
    }
  };

  const capitalizeName = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };


  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        <Box>
          <Text size="xl" fontWeight="$bold">
            Live Collector Tracking
          </Text>
          <Text color="$secondary500">
            Real-time location of garbage collection teams
          </Text>
        </Box>


        <Box h={300} borderRadius="$md" overflow="hidden">
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 11.0147,
              longitude: 124.6075,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            showsUserLocation={true}
          >
            {schedules.map((schedule) => (
              <Marker
                key={schedule._id}
                title={`Truck ID: ${schedule?.truck?.truck_id}`}
                coordinate={{
                  latitude: schedule?.truck?.position?.lat,
                  longitude: schedule?.truck?.position?.lng,
                }}
                description={`Garbage Type: ${schedule?.garbage_type}`}
                pinColor="green"
              />
            ))}
          </MapView>
        </Box>

        {/* Collectors List */}
        <VStack space="md">
          <Text size="lg" fontWeight="$bold">
            Active Collectors ({schedules.length})
          </Text>

          {schedules.map((schedule) => (
            <TouchableOpacity
              key={schedule._id}
            >
              <Card>
                <VStack space="sm">
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontWeight="$bold">{`${capitalizeName(
                      schedule?.truck?.user?.first_name
                    )} ${capitalizeName(
                      schedule?.truck?.user?.middle_name
                    )} ${capitalizeName(
                      schedule?.truck?.user?.last_name
                    )}`}</Text>
                    <Badge action={"success"}>
                      <BadgeText>{schedule?.truck?.status}</BadgeText>
                    </Badge>
                  </HStack>
                  <Text color="$secondary500">
                    {schedule?.truck?.truck_id} - {schedule.garbage_type}
                  </Text>
                  <Text size="sm">
                    +63{schedule?.truck?.user?.contact_number}
                  </Text>
                </VStack>
              </Card>
            </TouchableOpacity>
          ))}
        </VStack>

        {/* Legend */}
        <Card bg="$secondary50">
          <VStack space="sm">
            <Text fontWeight="$bold" size="sm">
              Map Legend
            </Text>
            {/* <HStack space="sm" alignItems="center">
              <Box w="$3" h="$3" bg="blue" rounded="$sm" />
              <Text size="sm">Your Location</Text>
            </HStack> */}
            <HStack space="sm" alignItems="center">
              <Box w="$3" h="$3" bg="green" rounded="$sm" />
              <Text size="sm">Active Collector</Text>
            </HStack>
            {/* <HStack space="sm" alignItems="center">
              <Box w="$3" h="$3" bg="orange" rounded="$sm" />
              <Text size="sm">Collector on Break</Text>
            </HStack> */}
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}
