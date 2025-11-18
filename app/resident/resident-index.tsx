import {
  Badge,
  BadgeText,
  Box,
  Button,
  Card,
  HStack,
  ScrollView,
  Text as GSText, // 👈 rename Gluestack's Text to avoid conflict
  useToast,
  VStack,
  Progress,
  ProgressFilledTrack,
} from "@gluestack-ui/themed";
import { View, Text } from "react-native"; // ✅ pure React Native primitives

import { Link, useRouter } from "expo-router";
import React, { useEffect, useState, useContext, useRef } from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import { useOffline } from "../../context/OfflineContext";
import {
  mockUser,
  staticCollectors,
  staticSchedule,
} from "../../data/staticData";

import { AuthContext } from "@/context/AuthContext"; 

import {
  AlertTriangle,
  MapPin,
  Calendar,
  Flag,
  Truck,
  User,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAllDataDashboardResident } from "../../hooks/dashboard_hook";

import { AppToast } from "@/components/ui/AppToast";

export interface ScheduleData {
  _id: string;
  [key: string]: any;
}
export default function ResidentDashboard() {
  const { user } = useContext(AuthContext)!;
  const { isOnline } = useOffline();
  const router = useRouter();
  const toast = useToast();
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const ws = useRef<WebSocket | null>(null);

  // Use static data instead of API call
  const collectors = staticCollectors;

  // Mock data for dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalReports: 0,
    completedReports: 0,
    pendingReports: 0,
    totalSchedules: 0,
    upcomingSchedules: 0,
    todaySchedules: 0,
    activeCollectors: 0,
    totalCollectors: collectors.length,
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchGarbageReports();
    }, [])
  );

  // WebSocket connection for real-time updates
  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket("wss://waste-wise-backend-uzub.onrender.com");

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.name) {
          case "trucks":
            console.log("running");

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
                    barangay.barangay_id._id.toString() === user?.barangay?._id
                )
              );
            });

            const list = user?.role !== "resident" ? message.data : onRouteTrucks;
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
      // console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const fetchGarbageReports = async () => {
    try {
      const { data, success } = await getAllDataDashboardResident(
        user?._id || "",
        user?.barangay?._id || ""
      );
      if (success === true) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySchedulesData = data?.schedules?.data.filter(
          (schedule: any) => {
            const scheduleDate = new Date(schedule.scheduled_collection);
            scheduleDate.setHours(0, 0, 0, 0);

            return scheduleDate.getTime() === today.getTime();
          }
        );

        const upcomingSchedulesData = data?.schedules?.data.filter(
          (schedule: any) => {
            const scheduleDate = new Date(schedule.scheduled_collection);
            scheduleDate.setHours(0, 0, 0, 0);

            return scheduleDate.getTime() > today.getTime();
          }
        );

        const onRouteTrucksCount = data?.schedules?.data.filter(
          (schedule: any) => {
            const scheduleDate = new Date(schedule.scheduled_collection);
            scheduleDate.setHours(0, 0, 0, 0);

            return (
              scheduleDate.getTime() === today.getTime() &&
              schedule.truck?.status === "On Route"
            );
          }
        );

        setDashboardStats((prevStats) => ({
          ...prevStats,
          totalSchedules: data.schedules.data.length,
          totalReports: data.garbage_reports.data.length,
          upcomingSchedules: upcomingSchedulesData.length,
          todaySchedules: todaySchedulesData.length,
          activeCollectors: onRouteTrucksCount.length,
        }));


        const onRouteTrucks = data.schedules.data.filter((schedule: any) => {
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

        const list = user?.role !== "resident" ? data.schedules.data : onRouteTrucks;

        setSchedules(list);
      }
    } catch (error) {
      console.log(error)
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Error"
            description="1Failed to load garbage report."
          />
        ),
      });
    }
  };

  // Helper function to capitalize each word
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
        {/* Header with Welcome & Status */}
        <Card bg="$primary50" p="$4" borderColor="$primary200">
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack space="xs" flex={1}>
              <GSText size="2xl" fontWeight="$bold" color="$primary900">
                Welcome back, {capitalizeName(user?.first_name)}!
              </GSText>
              <GSText color="$primary700" size="sm">
                {user?.barangay?.barangay_name} •{" "}
                {user?.role
                  ?.replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </GSText>

              {!isOnline && (
                <HStack space="sm" alignItems="center" mt="$2">
                  <AlertTriangle size={16} color="#DC2626" />
                  <GSText color="$error600" size="sm" fontWeight="$medium">
                    Offline Mode - Limited functionality
                  </GSText>
                </HStack>
              )}
            </VStack>

            <Box bg="$primary100" p="$2" rounded="$full">
              <User size={24} color="#1E40AF" />
            </Box>
          </HStack>
        </Card>

        {/* Stats Overview */}
        <VStack space="md">
          <GSText size="lg" fontWeight="$bold" color="$secondary800">
            Overview
          </GSText>

          <HStack space="md" flexWrap="wrap">
            <Card
              flex={1}
              minWidth="$32"
              p="$3"
              bg="$purple50"
              borderColor="$purple200"
            >
              <VStack space="xs" alignItems="center">
                <Box bg="$purple100" p="$2" rounded="$full">
                  <Calendar size={20} color="#7C3AED" />
                </Box>
                <GSText fontWeight="$bold" color="$purple900" size="xl">
                  {dashboardStats.totalSchedules}
                </GSText>
                <GSText color="$purple700" size="sm" textAlign="center">
                  Total Schedules
                </GSText>
              </VStack>
            </Card>

            <Card
              flex={1}
              minWidth="$32"
              p="$3"
              bg="$blue50"
              borderColor="$blue200"
            >
              <VStack space="xs" alignItems="center">
                <Box bg="$blue100" p="$2" rounded="$full">
                  <Flag size={20} color="#1E40AF" />
                </Box>
                <GSText fontWeight="$bold" color="$blue900" size="xl">
                  {dashboardStats.totalReports}
                </GSText>
                <GSText color="$blue700" size="sm" textAlign="center">
                  Total Reports
                </GSText>
              </VStack>
            </Card>

            {/* Schedules Card */}
            <Card
              flex={1}
              minWidth="$32"
              p="$3"
              bg="$green50"
              borderColor="$green200"
            >
              <VStack space="xs" alignItems="center">
                <Box bg="$green100" p="$2" rounded="$full">
                  <Calendar size={20} color="#059669" />
                </Box>
                <GSText fontWeight="$bold" color="$green900" size="xl">
                  {dashboardStats.upcomingSchedules}
                </GSText>
                <GSText color="$green700" size="sm" textAlign="center">
                  Upcoming Schedules
                </GSText>
              </VStack>
            </Card>

            <Card
              flex={1}
              minWidth="$32"
              p="$3"
              bg="$green50"
              borderColor="$green200"
            >
              <VStack space="xs" alignItems="center">
                <Box bg="$green100" p="$2" rounded="$full">
                  <Calendar size={20} color="#059669" />
                </Box>
                <GSText fontWeight="$bold" color="$green900" size="xl">
                  {dashboardStats.todaySchedules}
                </GSText>
                <GSText color="$green700" size="sm" textAlign="center">
                  Today Schedules
                </GSText>
              </VStack>
            </Card>
          </HStack>

          <HStack space="md" flexWrap="wrap">
            {/* Collectors Card */}
            <Card
              flex={1}
              minWidth="$32"
              p="$3"
              bg="$orange50"
              borderColor="$orange200"
            >
              <VStack space="xs" alignItems="center">
                <Box bg="$orange100" p="$2" rounded="$full">
                  <Truck size={20} color="#EA580C" />
                </Box>
                <GSText fontWeight="$bold" color="$orange900" size="xl">
                  {dashboardStats.activeCollectors}
                </GSText>
                <GSText color="$orange700" size="sm" textAlign="center">
                  Active Now
                </GSText>
              </VStack>
            </Card>

            {/* Pending Card */}
            {/* <Card
              flex={1}
              minWidth="$32"
              p="$3"
              bg="$red50"
              borderColor="$red200"
            >
              <VStack space="xs" alignItems="center">
                <Box bg="$red100" p="$2" rounded="$full">
                  <Clock size={20} color="#DC2626" />
                </Box>
                <Text fontWeight="$bold" color="$red900" size="xl">
                  {dashboardStats.pendingReports}
                </Text>
                <Text color="$red700" size="sm" textAlign="center">
                  Pending
                </Text>
              </VStack>
            </Card> */}
          </HStack>
        </VStack>

        {/* Live Collector Tracking */}
        <Card p="$4" borderColor="$primary200">
          <HStack justifyContent="space-between" alignItems="center" mb="$4">
            <VStack space="xs">
              <GSText size="lg" fontWeight="$bold" color="$secondary800">
                Live Collector Tracking
              </GSText>
              <GSText color="$secondary500" size="sm">
                Real-time garbage truck locations
              </GSText>
            </VStack>
            <Link href="/resident/resident-track_collectors" asChild>
              <Button size="sm" variant="link">
                <GSText color="$primary600">View All</GSText>
              </Button>
            </Link>
          </HStack>

          <Box h={300} borderRadius="$lg" overflow="hidden" mb="$3">
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: 10.936,
                longitude: 124.609,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              showsUserLocation={true}
            >
              {/* <Marker
                coordinate={{ latitude: 10.936, longitude: 124.609 }}
                title="Your Location"
                pinColor="red"
                /> */}

              {schedules.map((schedule, index) => (
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

          <VStack space="sm">
            {schedules.map((schedule) => (
              <HStack
                key={schedule._id}
                space="md"
                alignItems="center"
                p="$2"
                bg="$secondary50"
                rounded="$md"
              >
                <VStack flex={1} space="xs">
                  <GSText size="sm" fontWeight="$medium">
                    {`${capitalizeName(schedule.truck?.user?.first_name)} ${capitalizeName(schedule.truck?.user?.middle_name)} ${capitalizeName(schedule.truck?.user?.last_name)}`}
                  </GSText>
                  <GSText size="xs" color="$secondary600">
                    {schedule.truck?.truck_id} - {schedule.garbage_type}
                  </GSText>
                </VStack>
                {schedule.truck?.status && (
                  <Badge size="sm" action="success">
                    <Box w="$2" h="$2" bg="$success500" rounded="$full" />
                    <BadgeText size="xs"> {schedule.truck.status}</BadgeText>
                  </Badge>
                )}
              </HStack>
            ))}
          </VStack>

        </Card>
      </VStack>
    </ScrollView>
  );
}
