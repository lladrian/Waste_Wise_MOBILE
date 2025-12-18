// RESIDENT DASHBOARD — FIXED MAP FEATURES + NO OVERVIEW CHANGES

import {
  Badge,
  BadgeText,
  Box,
  Button,
  Card,
  HStack,
  ScrollView,
  Text as GSText,
  useToast,
  VStack,
} from "@gluestack-ui/themed";
import { View, Text } from "react-native";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState, useContext, useRef } from "react";
import MapView, { Marker, Callout, Polyline } from "react-native-maps";
import { useOffline } from "../../context/OfflineContext";
import { AuthContext } from "@/context/AuthContext";

import {
  AlertTriangle,
  Calendar,
  Flag,
  Truck,
  Bell,
} from "lucide-react-native";

import { useFocusEffect } from "@react-navigation/native";
import { getAllDataDashboardResident } from "../../hooks/dashboard_hook";
import { createNotificationSpecificUserResident } from "../../hooks/notification_hook";



import { AppToast } from "@/components/ui/AppToast";
import truckIcon from "../../assets/truck.png";

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

  const [dashboardStats, setDashboardStats] = useState({
    totalReports: 0,
    completedReports: 0,
    pendingReports: 0,
    totalSchedules: 0,
    upcomingSchedules: 0,
    todaySchedules: 0,
    activeCollectors: 0,
    onRouteCollectors: 0,
    totalCollectors: 0,
  });

  const [notificationCount] = useState(0);

  function getTodayDayName(): string {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const phTime = new Date(utc + 8 * 3600000);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[phTime.getDay()].toLowerCase();
  }

  // Helper: name capitalization
  const cap = (str?: string) =>
    str
      ? str
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
      : "";

  // Fetch dashboard data
  useFocusEffect(
    React.useCallback(() => {
      fetchGarbageReports();
      createNotificationResident();
    }, [])
  );


  useEffect(() => {
    ws.current = new WebSocket("wss://waste-wise-backend-uzub.onrender.com");

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.name === "trucks") {
          const today = getTodayDayName();

          const filtered = message.data.filter((schedule: any) => {
            return (
              Array.isArray(schedule.recurring_day) &&
              schedule.recurring_day.includes(today) &&
              schedule.route.merge_barangay.some(
                (b: any) => b.barangay_id._id.toString() === user?.barangay?._id
              )
            );
          });

          //         const todaySchedulesData = message.data.filter(
          //   (schedule: any) =>
          //     Array.isArray(schedule.recurring_day) &&
          //     schedule.recurring_day.includes(getTodayDayName())
          // );
          // // processSchedules(message.data);
          // setFilteredSchedules(todaySchedulesData);


          setSchedules(filtered);
        }
      } catch (err) {
        console.log("WS parse error:", err);
      }
    };

    return () => ws.current?.close();
  }, []);

  // API
  const createNotificationResident = async () => {
    try {
      const input_data = {
        user_id: user?._id || "",
        recurring_day: getTodayDayName()
      }
      const { data, success } = await createNotificationSpecificUserResident(input_data);

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

  const fetchGarbageReports = async () => {
    try {
      const { data, success } = await getAllDataDashboardResident(
        user?._id || "",
        user?.barangay?._id || ""
      );

      if (success) {
        const today = getTodayDayName();

        const todaySchedules = data.schedules.data.filter(
          (s: any) => Array.isArray(s.recurring_day) &&
            s.recurring_day.includes(today) &&
            s.route.merge_barangay.some(
              (b: any) =>
                b.barangay_id._id.toString() === user?.barangay?._id
            )
        );

        const upcomingSchedules = data.schedules.data.filter(
          (s: any) => Array.isArray(s.recurring_day) &&
            !s.recurring_day.includes(today) &&
            s.route.merge_barangay.some(
              (b: any) =>
                b.barangay_id._id.toString() === user?.barangay?._id
            )
        );


        const todayTrucks = data.schedules.data.filter((s: any) => {
          return (
            Array.isArray(s.recurring_day) &&
            s.recurring_day.includes(today) &&
            s.route.merge_barangay.some(
              (b: any) =>
                b.barangay_id._id.toString() === user?.barangay?._id
            )
          );
        });


        const onRouteTrucks = data.schedules.data.filter((s: any) => {
          return (
            Array.isArray(s.recurring_day) &&
            s.recurring_day.includes(today) &&
            s.truck?.status === "On Route" &&
            s.route.merge_barangay.some(
              (b: any) =>
                b.barangay_id._id.toString() === user?.barangay?._id
            )
          );
        });

        const activeTrucks = data.schedules.data.filter((s: any) => {
          return (
            Array.isArray(s.recurring_day) &&
            s.recurring_day.includes(today) &&
            s.truck?.status === "Active" &&
            s.route.merge_barangay.some(
              (b: any) =>
                b.barangay_id._id.toString() === user?.barangay?._id
            )
          );
        });

        const todayTrucksCount = data.schedules.data.filter((s: any) => {
          return (
            Array.isArray(s.recurring_day) &&
            s.recurring_day.includes(today) &&
            s.route.merge_barangay.some(
              (b: any) =>
                b.barangay_id._id.toString() === user?.barangay?._id
            )
          );
        });

        setDashboardStats({
          totalSchedules: data.schedules.data.length,
          totalReports: data.garbage_reports.data.length,
          upcomingSchedules: upcomingSchedules.length,
          todaySchedules: todaySchedules.length,
          activeCollectors: activeTrucks.length,
          onRouteCollectors: onRouteTrucks.length,
          totalCollectors: todayTrucksCount.length,
          completedReports: 0,
          pendingReports: 0,
        });

        setSchedules(todayTrucks);
      }
    } catch (err) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Error"
            description="Failed to load dashboard data."
          />
        ),
      });
    }
  };

  // MAP HELPERS ---------------------------- //

  const getRoutePoints = (schedule: any) =>
    schedule?.route?.route_points || [];

  const renderSchedulePolylines = (schedule: ScheduleData) => {
    const pts = getRoutePoints(schedule);

    const validPoints = pts
      .filter((p: any) => p?.lat && p?.lng)
      .map((p: any) => ({
        latitude: p.lat,
        longitude: p.lng,
      }));

    if (validPoints.length === 0) return null;

    return (
      <Polyline
        key={`polyline-${schedule._id}`}
        coordinates={validPoints}
        strokeColor={schedule?.route?.polyline_color || "#00008B"}
        strokeWidth={3}
      // strokeOpacity={0.6}
      />
    );
  };

  const renderAllPolylines = () =>
    schedules.map((s) => renderSchedulePolylines(s));

  const handleNotificationPress = () => {
    router.push("/notification");
  };

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">

        {/* HEADER — unchanged */}
        <Card bg="$primary50" p="$4" borderColor="$primary200">
          <HStack justifyContent="space-between">
            <VStack flex={1}>
              <HStack justifyContent="space-between" alignItems="center">
                <GSText size="2xl" fontWeight="$bold" color="$primary900">
                  Welcome back, {cap(user?.first_name)}!
                </GSText>

                <Button variant="link" onPress={handleNotificationPress}>
                  <Box position="relative">
                    <Bell size={24} color="#1E40AF" />
                    {notificationCount > 0 && (
                      <Box
                        position="absolute"
                        top={-5}
                        right={-5}
                        bg="$red500"
                        w="$4"
                        h="$4"
                        rounded="$full"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <GSText size="2xs" color="$white">
                          {notificationCount}
                        </GSText>
                      </Box>
                    )}
                  </Box>
                </Button>
              </HStack>

              <GSText color="$primary700" size="sm">
                {user?.barangay?.barangay_name} • Resident
              </GSText>

              {!isOnline && (
                <HStack mt="$2">
                  <AlertTriangle size={16} color="#DC2626" />
                  <GSText color="$error600" size="sm" ml="$1">
                    Offline Mode
                  </GSText>
                </HStack>
              )}
            </VStack>
          </HStack>
        </Card>

        {/* OVERVIEW SECTION — unchanged */}
        {/* 💥 NO CHANGES WERE MADE HERE PER YOUR REQUEST */}

        <VStack space="md">
          <GSText size="lg" fontWeight="$bold" color="$secondary800">
            Overview
          </GSText>

          {/* Your original Overview layout kept exactly the same */}
          <HStack space="md" flexWrap="wrap">
            {/* Cards are unchanged */}
            <Card flex={1} minWidth="$32" p="$3" bg="$purple50" borderColor="$purple200">
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

            <Card flex={1} minWidth="$32" p="$3" bg="$blue50" borderColor="$blue200">
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

            <Card flex={1} minWidth="$32" p="$3" bg="$green50" borderColor="$green200">
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

            <Card flex={1} minWidth="$32" p="$3" bg="$green50" borderColor="$green200">
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
            <Card flex={1} minWidth="$32" p="$3" bg="$orange50" borderColor="$orange200">
              <VStack space="xs" alignItems="center">
                <Box bg="$orange100" p="$2" rounded="$full">
                  <Truck size={20} color="#EA580C" />
                </Box>
                <GSText fontWeight="$bold" color="$orange900" size="xl">
                  {dashboardStats.onRouteCollectors}
                </GSText>
                <GSText color="$orange700" size="sm" textAlign="center">
                  On Route
                </GSText>
              </VStack>
            </Card>
          </HStack>


          <HStack space="md" flexWrap="wrap">
            <Card flex={1} minWidth="$32" p="$3" bg="$blue50" borderColor="$blue200">
              <VStack space="xs" alignItems="center">
                <Box bg="$blue100" p="$2" rounded="$full">
                  <Truck size={20} color="#3B82F6" />
                </Box>
                <GSText fontWeight="$bold" color="$blue900" size="xl">
                  {dashboardStats.activeCollectors}
                </GSText>
                <GSText color="$blue700" size="sm" textAlign="center">
                  Available
                </GSText>
              </VStack>
            </Card>
          </HStack>

          <HStack space="md" flexWrap="wrap">
            <Card flex={1} minWidth="$32" p="$3" bg="$gray50" borderColor="$gray200">
              <VStack space="xs" alignItems="center">
                <Box bg="$gray100" p="$2" rounded="$full">
                  <Truck size={20} color="#6b7280" />
                </Box>
                <GSText fontWeight="$bold" color="$gray900" size="xl">
                  {dashboardStats.totalCollectors}
                </GSText>
                <GSText color="$gray700" size="sm" textAlign="center">
                  Trucks
                </GSText>
              </VStack>
            </Card>
          </HStack>
        </VStack>

        {/* LIVE COLLECTOR TRACKING — POLYLINES INSERTED HERE */}
        <Card p="$4">
          <HStack justifyContent="space-between" mb="$4">
            <VStack>
              <GSText size="lg" fontWeight="$bold">
                Live Collector Tracking
              </GSText>
              <GSText size="sm" color="$secondary500">
                Real-time garbage truck locations
              </GSText>
            </VStack>

            <Link href="/resident/resident-track_collectors" asChild>
              <Button size="sm" variant="link">
                <GSText color="$primary600">View All</GSText>
              </Button>
            </Link>
          </HStack>

          {/* MAP WITH POLYLINES */}
          <Box h={300} borderRadius="$lg" overflow="hidden" mb="$3">
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: 10.936,
                longitude: 124.609,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
            >
              {/* ✔ Render Polylines like Guest */}
              {renderAllPolylines()}

              {/* ✔ Markers */}
              {schedules.map((schedule) => (
                <Marker
                  key={schedule._id}
                  coordinate={{
                    latitude: schedule?.truck?.position?.lat || 11.0147,
                    longitude: schedule?.truck?.position?.lng || 124.6075,
                  }}
                  rotation={schedule?.truck?.heading}
                  title={`Truck ID: ${schedule?.truck?.truck_id}`}
                  description={`${schedule?.garbage_type} - ${schedule?.truck?.status}`}
                  image={truckIcon}
                />
              ))}
            </MapView>
          </Box>

          {/* ✔ Route Color Legend (Just like Guest) */}
          {schedules.length > 0 && (
            <Card bg="$gray100" mb="$3">
              <VStack space="sm" p="$3">
                <GSText size="sm" fontWeight="$bold">Route Colors</GSText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack space="lg">
                    {schedules
                      .filter(
                        (s, i, arr) =>
                          i ===
                          arr.findIndex(
                            (x) =>
                              x.route?.polyline_color ===
                              s.route?.polyline_color
                          )
                      )
                      .map((schedule) => (
                        <HStack
                          key={schedule._id}
                          alignItems="center"
                          space="xs"
                        >
                          <Box
                            w="$3"
                            h="$3"
                            bg={schedule.route?.polyline_color}
                            rounded="$sm"
                          />
                          <GSText size="xs">
                            {schedule.route?.route_name}
                          </GSText>
                        </HStack>
                      ))}
                  </HStack>
                </ScrollView>
              </VStack>
            </Card>
          )}

          {/* LIST — unchanged except added route color indicator */}
          <VStack space="sm">
            {schedules.map((schedule) => (
              <HStack
                key={schedule._id}
                p="$2"
                bg="$secondary50"
                rounded="$md"
                alignItems="center"
              >
                <VStack flex={1}>
                  <GSText size="sm" fontWeight="$medium">
                    {cap(schedule.truck?.user?.first_name)}{" "}
                    {cap(schedule.truck?.user?.middle_name)}{" "}
                    {cap(schedule.truck?.user?.last_name)}
                  </GSText>

                  <GSText size="xs" color="$secondary600">
                    {schedule.truck?.truck_id} - {schedule.garbage_type}
                  </GSText>

                  {schedule.route?.route_name && (
                    <HStack alignItems="center" space="xs">
                      <Box
                        w="$2"
                        h="$2"
                        bg={schedule.route?.polyline_color}
                        rounded="$sm"
                      />
                      <GSText size="xs" color="$secondary600">
                        {schedule.route?.route_name}
                      </GSText>
                    </HStack>
                  )}
                </VStack>

                <Badge size="sm" action="success">
                  <Box w="$2" h="$2" bg="$success500" rounded="$full" />
                  <BadgeText size="xs">{schedule.truck?.status}</BadgeText>
                </Badge>
              </HStack>
            ))}
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}
