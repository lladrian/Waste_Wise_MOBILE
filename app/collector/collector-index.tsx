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
  Bell, // Added Bell icon import
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAllDataDashboardCollector } from "../../hooks/dashboard_hook";
import { createNotificationSpecificUserCollector } from "../../hooks/notification_hook";




import { AppToast } from "@/components/ui/AppToast";
import { useLocation } from '@/context/LocationContext';


export interface ScheduleData {
  _id: string;
  [key: string]: any;
}
export default function CollectorDashboard() {
  const { user, refresh } = useContext(AuthContext)!;
  const { isOnline } = useOffline();
  const router = useRouter();
  const toast = useToast();
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const { connectWebSocket } = useLocation();

  // Add notification state
  const [notificationCount, setNotificationCount] = useState(0);

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
    totalCollectors: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchGarbageReports();
      connectWebSocket();
      createNotificationCollector();
    }, [])
  );


   const createNotificationCollector = async () => {
    try {
      const input_data = {
        user_id: user?._id || "",
        recurring_day: getTodayDayName()
      }
      const { data, success } = await createNotificationSpecificUserCollector(input_data);

      if (success) {
        console.log('created')
      }
    } catch (err) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Error"
            description="Failed to create notification."
          />
        ),
      });
    }
  };

  // Function to handle notification button press
  const handleNotificationPress = () => {
    router.push("/notification"); // Adjust route based on your structure
    // Or use: router.push("/notifications");
  };

  function getTodayDayName(): string {
    const now: Date = new Date();

    // Convert to Philippines time (UTC+8)
    const utc: number = now.getTime() + now.getTimezoneOffset() * 60000;
    const philippinesTime: Date = new Date(utc + 8 * 3600000);

    const days: string[] = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    const dayName: string = days[philippinesTime.getDay()];

    return dayName.toLowerCase();
  }


  const fetchGarbageReports = async () => {
    try {
      const { data, success } = await getAllDataDashboardCollector(user?._id || "");
 
      if (success === true) {
        const todaySchedulesData = data?.schedules?.data.filter(
          (schedule: any) => 
            Array.isArray(schedule.recurring_day) && 
            schedule.recurring_day.includes(getTodayDayName())
        );

        const upcomingSchedulesData = data?.schedules?.data.filter(
          (schedule: any) =>
            Array.isArray(schedule.recurring_day) && 
            !schedule.recurring_day.includes(getTodayDayName())
        );

        const onRouteTrucksCount = data?.schedules?.data.filter(
          (schedule: any) => {
            return (
              Array.isArray(schedule.recurring_day) && 
              schedule.recurring_day.includes(getTodayDayName()) &&
              schedule.truck?.status === "On Route"
            );
          }
        );

        setDashboardStats((prevStats) => ({
          ...prevStats,
          totalSchedules: data.schedules.data.length,
          totalReports: data.collector_reports.data.length,
          upcomingSchedules: upcomingSchedulesData.length,
          todaySchedules: todaySchedulesData.length,
          activeCollectors: onRouteTrucksCount.length,
        }));

        const onRouteTrucks = data.schedules.data.filter((schedule: any) => {
          return (
            Array.isArray(schedule.recurring_day) && 
            schedule.recurring_day.includes(getTodayDayName()) &&
            schedule.truck?.status === "On Route" &&
            schedule.route.merge_barangay.some(
              (barangay: any) =>
                barangay.barangay_id.toString() === user?.barangay?._id
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
            description="Failed to load garbage report."
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
              <HStack justifyContent="space-between" alignItems="center">
                <GSText size="2xl" fontWeight="$bold" color="$primary900">
                  Welcome back, {capitalizeName(user?.first_name)}!
                </GSText>
                
                {/* Notification Button - Moved inside VStack for proper alignment */}
                <Button 
                  onPress={handleNotificationPress}
                  variant="link"
                  p="$1"
                  position="relative"
                >
                  <Box position="relative">
                    <Bell size={24} color="#1E40AF" />
                    {notificationCount > 0 && (
                      <Box
                        position="absolute"
                        top={-5}
                        right={-5}
                        bg="$red500"
                        rounded="$full"
                        w="$4"
                        h="$4"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <GSText size="2xs" color="$white" fontWeight="$bold">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </GSText>
                      </Box>
                    )}
                  </Box>
                </Button>
              </HStack>
              
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

            {/* User Avatar - Keep this if you want it on the right side */}
            {/* <Box bg="$primary100" p="$2" rounded="$full" ml="$2">
              <User size={24} color="#1E40AF" />
            </Box> */}
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
            {/* <Card
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
            </Card> */}

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
        {/* <Card p="$4" borderColor="$primary200"> */}
          {/* <HStack justifyContent="space-between" alignItems="center" mb="$4">
            <VStack space="xs">
              <GSText size="lg" fontWeight="$bold" color="$secondary800">
                Live Collector Tracking
              </GSText>
              <GSText color="$secondary500" size="sm">
                Real-time garbage truck locations
              </GSText>
            </VStack>
            <Link href="/resident/track_collectors" asChild>
            <Link href="/" asChild>
              <Button size="sm" variant="link">
                <GSText color="$primary600">View All</GSText>
              </Button>
            </Link>
          </HStack> */}

          {/* <Box h={300} borderRadius="$lg" overflow="hidden" mb="$3">
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
          </Box> */}
        {/* </Card> */}
      </VStack>
    </ScrollView>
  );
}