import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonText,
  Card,
  HStack,
  ScrollView,
  Text,
  VStack,
  Input,
  InputField,
  InputIcon,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
  Divider,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Center,
  Icon,
  CloseIcon as GluestackCloseIcon,
} from "@gluestack-ui/themed";
import { Alert, TouchableOpacity, Dimensions } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { AppToast } from "@/components/ui/AppToast";
import { useToast } from "@gluestack-ui/themed";
import { AuthContext } from "@/context/AuthContext";
import { getAllSchedule } from "../../hooks/track_collector_hook";
import { useFocusEffect } from "@react-navigation/native";
import {
  Search,
  Filter,
  Truck,
  MapPin,
  Calendar,
  User,
  X as CloseIcon,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";

import truckIcon from "../../assets/truck.png";

export interface ScheduleData {
  _id: string;
  [key: string]: any;
}

export default function GuestTrackCollectorsScreen() {
  const toast = useToast();
  // const { user } = useContext(AuthContext)!;
  const ws = useRef<WebSocket | null>(null);
  const mapRef = useRef<MapView>(null);
  const { width, height } = Dimensions.get('window');

  // State
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states - ADDED BARANGAY FILTER
  const [filters, setFilters] = useState({
    status: "all",
    garbageType: "all",
    routeName: "all",
    driverName: "all",
    scheduleDay: "all",
    barangay: "all", // NEW FILTER
  });

  // Available filters - ADDED BARANGAYS
  const [availableFilters, setAvailableFilters] = useState({
    statuses: ["all", "On Route", "Active", "Inactive"],
    garbageTypes: ["all"],
    routeNames: ["all"],
    driverNames: ["all"],
    scheduleDays: ["all", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    barangays: ["all"], // NEW FILTER OPTIONS
  });

  // WebSocket for real-time updates
  useEffect(() => {
    ws.current = new WebSocket("wss://waste-wise-backend-uzub.onrender.com");

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.name === "trucks") {
          const todaySchedulesData = message.data.filter(
            (schedule: any) =>
              Array.isArray(schedule.recurring_day) &&
              schedule.recurring_day.includes(getTodayDayName())
          );

          const selectedTodaySchedulesData = message.data.filter(
            (schedule: any) =>
              Array.isArray(schedule?.recurring_day) &&
              schedule.recurring_day.includes(getTodayDayName()) &&
              schedule._id === selectedSchedule?._id
          );

          // processSchedules(message.data);
          setFilteredSchedules(todaySchedulesData);
          setSelectedSchedule(selectedTodaySchedulesData[0]);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onopen = () => console.log("WebSocket connected for schedules");
    ws.current.onclose = () => console.log("WebSocket disconnected");
    ws.current.onerror = (error) => console.error("WebSocket error:", error);

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchSchedules();
    }, [])
  );

  function getTodayDayName(): string {
    const now: Date = new Date();
    const utc: number = now.getTime() + now.getTimezoneOffset() * 60000;
    const philippinesTime: Date = new Date(utc + 8 * 3600000);
    const days: string[] = [
      "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
    ];
    return days[philippinesTime.getDay()];
  }

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const { data, success } = await getAllSchedule();
      if (success === true) {
        const todaySchedulesData = data.data.filter(
          (schedule: any) =>
            Array.isArray(schedule.recurring_day) &&
            schedule.recurring_day.includes(getTodayDayName())
        );

        processSchedules(data.data);
      }
    } catch (error) {
      console.error("Fetch schedules error:", error);
      showToast("Failed to load schedules", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const processSchedules = (data: ScheduleData[]) => {
    let processedSchedules = data;

    // processedSchedules = processedSchedules.filter((schedule: any) =>
    //   schedule?.truck?.position?.lat && schedule?.truck?.position?.lng
    // );

    console.log("Processed schedules:", processedSchedules.length);
    setSchedules(processedSchedules);
    updateAvailableFilters(processedSchedules);
    applyFilters(processedSchedules, filters, searchTerm);
  };

  const updateAvailableFilters = (data: ScheduleData[]) => {
    const garbageTypes = ["all", ...new Set(data.map(item => item.garbage_type || "Unknown"))];
    const routeNames = ["all", ...new Set(data.map(item =>
      item.route?.route_name || "No Route"
    ))];
    const driverNames = ["all", ...new Set(data.map(item =>
      item.truck?.user ?
        `${item.truck.user.first_name || ""} ${item.truck.user.last_name || ""}`.trim() :
        "No Driver"
    ))];

    // Extract unique barangays from route.merge_barangay
    const barangaysSet = new Set<string>();
    data.forEach(item => {
      if (item?.route?.merge_barangay && Array.isArray(item.route.merge_barangay)) {
        item.route.merge_barangay.forEach((barangay: any) => {
          if (barangay?.barangay_id?.barangay_name) {
            barangaysSet.add(barangay.barangay_id.barangay_name);
          }
        });
      }
    });
    const barangays = ["all", ...Array.from(barangaysSet).sort()];

    setAvailableFilters(prev => ({
      ...prev,
      garbageTypes,
      routeNames,
      driverNames,
      barangays, // ADDED BARANGAYS
    }));
  };

  const applyFilters = (data: ScheduleData[], filterState: any, search: string) => {
    let filtered = [...data];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(schedule => {
        return (
          schedule.truck?.truck_id?.toLowerCase().includes(searchLower) ||
          schedule.route?.route_name?.toLowerCase().includes(searchLower) ||
          schedule.garbage_type?.toLowerCase().includes(searchLower) ||
          `${schedule.truck?.user?.first_name || ""} ${schedule.truck?.user?.last_name || ""}`
            .toLowerCase().includes(searchLower) ||
          schedule?.route?.merge_barangay?.some((barangay: any) =>
            barangay.barangay_id?.barangay_name?.toLowerCase().includes(searchLower)
          )
        );
      });
    }

    if (filterState.status !== "all") {
      filtered = filtered.filter(
        schedule => schedule.truck?.status === filterState.status
      );
    }

    if (filterState.garbageType !== "all") {
      filtered = filtered.filter(
        schedule => schedule.garbage_type === filterState.garbageType
      );
    }

    if (filterState.routeName !== "all") {
      filtered = filtered.filter(
        schedule => schedule.route?.route_name === filterState.routeName
      );
    }

    if (filterState.driverName !== "all") {
      filtered = filtered.filter(schedule => {
        const driverName = schedule.truck?.user ?
          `${schedule.truck.user.first_name || ""} ${schedule.truck.user.last_name || ""}`.trim() :
          "No Driver";
        return driverName === filterState.driverName;
      });
    }

    if (filterState.scheduleDay !== "all") {
      filtered = filtered.filter(
        schedule =>
          Array.isArray(schedule.recurring_day) &&
          schedule.recurring_day.includes(filterState.scheduleDay)
      );
    }

    // NEW BARANGAY FILTER LOGIC
    if (filterState.barangay !== "all") {
      filtered = filtered.filter(schedule => {
        if (!schedule?.route?.merge_barangay || !Array.isArray(schedule.route.merge_barangay)) {
          return false;
        }
        return schedule.route.merge_barangay.some((barangay: any) =>
          barangay?.barangay_id?.barangay_name === filterState.barangay
        );
      });
    }

    setFilteredSchedules(filtered);
  };

  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    applyFilters(schedules, newFilters, searchTerm);
  };

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    applyFilters(schedules, filters, text);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      status: "all",
      garbageType: "all",
      routeName: "all",
      driverName: "all",
      scheduleDay: "all",
      barangay: "all", // ADDED BARANGAY
    };
    setFilters(clearedFilters);
    setSearchTerm("");
    applyFilters(schedules, clearedFilters, "");
  };

  const isAnyFilterActive = () => {
    return Object.values(filters).some(filter => filter !== "all") || searchTerm;
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    toast.show({
      placement: "top right",
      render: ({ id }) => (
        <AppToast
          id={id}
          type={type}
          title={type === "success" ? "Success" : "Error"}
          description={message}
        />
      ),
    });
  };

  const capitalizeName = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDriverName = (driver: any) => {
    if (!driver) return "No driver assigned";
    return `${capitalizeName(driver.first_name)} ${capitalizeName(driver.middle_name)} ${capitalizeName(driver.last_name)}`.trim();
  };

  const getRoutePoints = (schedule: any) => {
    return schedule?.route?.route_points || [];
  };

  const getBarangaysCovered = (schedule: any) => {
    if (!schedule?.task) return [];
    return schedule.task.map((barangay: any) => ({
      name: barangay.barangay_id?.barangay_name || "Unknown Barangay",
      status: barangay.status || "Pending"
    }));
  };

  const handleScheduleSelect = (schedule: ScheduleData) => {
    setSelectedSchedule(schedule);

    if (schedule?.truck?.position?.lat && schedule?.truck?.position?.lng) {
      mapRef.current?.animateToRegion({
        latitude: schedule.truck.position.lat,
        longitude: schedule.truck.position.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  };

  const renderAllRoutePolylines = () => {
    return filteredSchedules.map((schedule) => {
      const routePoints = getRoutePoints(schedule);

      if (!routePoints || routePoints.length === 0) return null;

      const validPoints = routePoints
        .filter((point: any) => point && point.lat && point.lng)
        .map((point: any) => ({
          latitude: point.lat,
          longitude: point.lng,
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
    });
  };

  // Custom Select Component for centered dropdown
  const CenteredSelect = ({
    value,
    onValueChange,
    items,
    placeholder,
    label
  }: any) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <VStack space="sm" flex={1}>
          <Text size="sm" fontWeight="$semibold">{label}</Text>
          <TouchableOpacity onPress={() => setIsOpen(true)}>
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              borderWidth={1}
              borderColor="$borderDark300"
              borderRadius="$md"
              p="$3"
              bg="$white"
            >
              <Text>
                {value === "all" ? placeholder : value}
              </Text>
              <Icon as={ChevronDown} size="sm" color="#6b7280" />
            </Box>
          </TouchableOpacity>
        </VStack>

        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <ModalBackdrop />
          <ModalContent
            style={{
              position: 'absolute',
              width: width * 0.85,
              maxHeight: height * 0.7,
              margin: 'auto',
            }}
          >
            <ModalHeader>
              <Text fontWeight="$bold">{label}</Text>
              <ModalCloseButton onPress={() => setIsOpen(false)}>
                <Icon as={GluestackCloseIcon} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <ScrollView showsVerticalScrollIndicator={false}>
                {items.map((item: string) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      onValueChange(item);
                      setIsOpen(false);
                    }}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f1f1f1',
                    }}
                  >
                    <Text
                      color={value === item ? "$primary600" : "$textDark800"}
                      fontWeight={value === item ? "$bold" : "$normal"}
                    >
                      {item === "all" ? placeholder : item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  };

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        {/* Header */}
        <Box>
          <Text size="xl" fontWeight="$bold">
            Live Collector Tracking
          </Text>
          <Text color="#9ca3af">
            Real-time location of garbage collection teams
          </Text>
        </Box>

        {/* Statistics Cards */}
        <HStack space="sm" justifyContent="space-between">
          <Card flex={1} bg="$red50">
            <VStack space="xs">
              <HStack alignItems="center" space="sm">
                <Truck size={16} color="#ef4444" />
                <Text size="sm" color="$textDark600">On Route</Text>
              </HStack>
              <Text size="xl" fontWeight="$bold">
                {schedules.filter(s => s.truck?.status === "On Route").length}
              </Text>
            </VStack>
          </Card>
          <Card flex={1} bg="$blue50">
            <VStack space="xs">
              <HStack alignItems="center" space="sm">
                <Truck size={16} color="#3b82f6" />
                <Text size="sm" color="$textDark600">Available</Text>
              </HStack>
              <Text size="xl" fontWeight="$bold">
                {schedules.filter(s => s.truck?.status === "Active").length}
              </Text>
            </VStack>
          </Card>
          <Card flex={1} bg="$gray100">
            <VStack space="xs">
              <HStack alignItems="center" space="sm">
                <Truck size={16} color="#6b7280" />
                <Text size="sm" color="$textDark600">Trucks</Text>
              </HStack>
              <Text size="xl" fontWeight="$bold">{schedules.length}</Text>
            </VStack>
          </Card>
        </HStack>

        {/* Filter Panel */}
        <Card>
          <VStack space="sm">
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
              <HStack justifyContent="space-between" alignItems="center">
                <HStack alignItems="center" space="sm">
                  <Filter size={20} color="#6b7280" />
                  <VStack>
                    <Text fontWeight="$semibold">Filters & Search</Text>
                    <Text size="sm" color="#6b7280">
                      {isAnyFilterActive() ? "Active filters applied" : "Filter schedules"}
                    </Text>
                  </VStack>
                </HStack>
                <HStack alignItems="center" space="sm">
                  {isAnyFilterActive() && (
                    <TouchableOpacity onPress={clearAllFilters}>
                      <HStack alignItems="center" space="xs" bg="$red50" p="$2" rounded="$sm">
                        <X size={14} color="#dc2626" />
                        <Text size="sm" color="$red600">Clear</Text>
                      </HStack>
                    </TouchableOpacity>
                  )}
                  {showFilters ? <ChevronUp size={20} color="#6b7280" /> : <ChevronDown size={20} color="#6b7280" />}
                </HStack>
              </HStack>
            </TouchableOpacity>

            {showFilters && (
              <VStack space="md" mt="$2">
                {/* Search */}
                <Input>
                  <InputIcon as={Search} />
                  <InputField
                    placeholder="Search by truck ID, route, driver, barangay..."
                    value={searchTerm}
                    onChangeText={handleSearch}
                  />
                </Input>

                {/* Filter Grid */}
                <VStack space="sm">
                  <CenteredSelect
                    label="Truck Status"
                    value={filters.status}
                    onValueChange={(value: string) => handleFilterChange("status", value)}
                    items={availableFilters.statuses}
                    placeholder="Select Status"
                  />
                </VStack>

                <HStack space="sm">
                  <CenteredSelect
                    label="Garbage Type"
                    value={filters.garbageType}
                    onValueChange={(value: string) => handleFilterChange("garbageType", value)}
                    items={availableFilters.garbageTypes}
                    placeholder="Select Type"
                  />
                </HStack>


                <HStack space="sm">
                  <CenteredSelect
                    label="Barangay"
                    value={filters.barangay}
                    onValueChange={(value: string) => handleFilterChange("barangay", value)}
                    items={availableFilters.barangays}
                    placeholder="Select Barangay"
                  />
                </HStack>

                <HStack space="sm">
                  <CenteredSelect
                    label="Route Name"
                    value={filters.routeName}
                    onValueChange={(value: string) => handleFilterChange("routeName", value)}
                    items={availableFilters.routeNames}
                    placeholder="Select Route"
                  />
                  {/* <CenteredSelect
                    label="Driver"
                    value={filters.driverName}
                    onValueChange={(value: string) => handleFilterChange("driverName", value)}
                    items={availableFilters.driverNames}
                    placeholder="Select driver"
                  /> */}
                </HStack>

                <HStack space="sm">
                  <CenteredSelect
                    label="Schedule Day"
                    value={filters.scheduleDay}
                    onValueChange={(value: string) => handleFilterChange("scheduleDay", value)}
                    items={availableFilters.scheduleDays}
                    placeholder="Select day"
                  />
                </HStack>

                {/* Active Filter Tags */}
                {isAnyFilterActive() && (
                  <VStack space="sm">
                    <Text size="sm" fontWeight="$semibold">Active Filters:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <HStack space="sm">
                        {filters.status !== "all" && (
                          <Badge action="error">
                            <BadgeText>Status: {filters.status}</BadgeText>
                            <TouchableOpacity onPress={() => handleFilterChange("status", "all")}>
                              <X size={12} color="white" />
                            </TouchableOpacity>
                          </Badge>
                        )}
                        {filters.garbageType !== "all" && (
                          <Badge action="info">
                            <BadgeText>Type: {filters.garbageType}</BadgeText>
                            <TouchableOpacity onPress={() => handleFilterChange("garbageType", "all")}>
                              <X size={12} color="white" />
                            </TouchableOpacity>
                          </Badge>
                        )}
                        {filters.routeName !== "all" && (
                          <Badge action="success">
                            <BadgeText>Route: {filters.routeName}</BadgeText>
                            <TouchableOpacity onPress={() => handleFilterChange("routeName", "all")}>
                              <X size={12} color="white" />
                            </TouchableOpacity>
                          </Badge>
                        )}
                        {filters.driverName !== "all" && (
                          <Badge action="warning">
                            <BadgeText>Driver: {filters.driverName}</BadgeText>
                            <TouchableOpacity onPress={() => handleFilterChange("driverName", "all")}>
                              <X size={12} color="white" />
                            </TouchableOpacity>
                          </Badge>
                        )}
                        {filters.scheduleDay !== "all" && (
                          <Badge>
                            <BadgeText>Day: {filters.scheduleDay}</BadgeText>
                            <TouchableOpacity onPress={() => handleFilterChange("scheduleDay", "all")}>
                              <X size={12} color="white" />
                            </TouchableOpacity>
                          </Badge>
                        )}
                        {/* NEW BARANGAY FILTER BADGE */}
                        {filters.barangay !== "all" && (
                          <Badge bg="$purple200">
                            <BadgeText color="$purple800">Barangay: {filters.barangay}</BadgeText>
                            <TouchableOpacity onPress={() => handleFilterChange("barangay", "all")}>
                              <X size={12} color="#7c3aed" />
                            </TouchableOpacity>
                          </Badge>
                        )}
                        {searchTerm && (
                          <Badge bg="$gray200">
                            <BadgeText color="$textDark800">Search: "{searchTerm}"</BadgeText>
                            <TouchableOpacity onPress={() => setSearchTerm("")}>
                              <X size={12} color="#6b7280" />
                            </TouchableOpacity>
                          </Badge>
                        )}
                      </HStack>
                    </ScrollView>
                  </VStack>
                )}
              </VStack>
            )}
          </VStack>
        </Card>

        {/* Results Summary */}
        <Card bg="$gray100">
          <HStack justifyContent="space-between" alignItems="center">
            <Text>
              Showing {filteredSchedules.length} of {schedules.length} schedules
            </Text>
            {/* <Button size="sm" variant="outline" onPress={fetchSchedules} disabled={isLoading}>
              <ButtonText>{isLoading ? "Loading..." : "Refresh"}</ButtonText>
            </Button> */}
          </HStack>
        </Card>

        {/* Map Section */}
        <Box h={300} borderRadius="$md" overflow="hidden">
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 11.0147,
              longitude: 124.6075,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            showsUserLocation={false}
          >
            {renderAllRoutePolylines()}

            {filteredSchedules.map((schedule) => (
              <Marker
                key={schedule._id}
                coordinate={{
                  latitude: schedule?.truck?.position?.lat || 11.0147,
                  longitude: schedule?.truck?.position?.lng || 124.6075,
                }}
                title={`Truck ID: ${schedule?.truck?.truck_id}`}
                description={`${schedule?.garbage_type} - ${schedule?.truck?.status}`}
                image={truckIcon}
                rotation={schedule?.truck?.heading}
                // rotation={250}
                onPress={() => handleScheduleSelect(schedule)}
              />
            ))}
          </MapView>
        </Box>

        {/* Schedules List */}
        <VStack space="md" mb="$20">
          <Text size="lg" fontWeight="$bold">
            Schedules ({filteredSchedules.length})
          </Text>

          {filteredSchedules.length === 0 ? (
            <Card bg="$gray100">
              <VStack space="sm" alignItems="center" p="$4">
                <Truck size={48} color="#9ca3af" />
                <Text fontWeight="$semibold">No schedules found</Text>
                <Text color="#6b7280" textAlign="center">
                  {isAnyFilterActive()
                    ? "Try adjusting your filters to find schedules"
                    : "No schedules available"}
                </Text>
                {isAnyFilterActive() && (
                  <Button onPress={clearAllFilters} size="sm" mt="$2">
                    <ButtonText>Clear Filters</ButtonText>
                  </Button>
                )}
              </VStack>
            </Card>
          ) : (
            filteredSchedules.map((schedule) => {
              const barangays = schedule?.task || [];

              return (
                <TouchableOpacity
                  key={schedule._id}
                  onPress={() => handleScheduleSelect(schedule)}
                >
                  <Card bg={selectedSchedule?._id === schedule._id ? "$blue50" : "$white"}>
                    <VStack space="sm">
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontWeight="$bold">
                          Truck: {schedule?.truck?.truck_id || "Unknown"}
                        </Text>
                        <Badge action={schedule?.truck?.status === "On Route" ? "error" : "success"}>
                          <BadgeText>{schedule?.truck?.status || "Unknown"}</BadgeText>
                        </Badge>
                      </HStack>

                      <Text color="#6b7280">
                        {schedule?.route?.route_name || "No Route"} • {schedule.garbage_type}
                      </Text>

                      <Divider />

                      <VStack space="xs">
                        <HStack space="sm" alignItems="center">
                          <User size={14} color="#6b7280" />
                          <Text size="sm">
                            {formatDriverName(schedule?.truck?.user)}
                          </Text>
                        </HStack>
                        <HStack space="sm" alignItems="center">
                          <Calendar size={14} color="#6b7280" />
                          <Text size="sm">
                            {Array.isArray(schedule.recurring_day) && schedule.recurring_day.length > 0
                              ? schedule.recurring_day
                                .map((day: string) => day.charAt(0).toUpperCase() + day.slice(1))
                                .join(", ")
                              : "-"}
                          </Text>
                        </HStack>
                        <HStack space="sm" alignItems="center">
                          <MapPin size={14} color="#6b7280" />
                          <Text size="sm">
                            {barangays.length} barangay(s) covered
                          </Text>
                        </HStack>
                      </VStack>

                      {/* Barangay Status Badges */}
                      {barangays.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <HStack space="sm" mt="$2">
                            {barangays.map((barangay: any, index: number) => (
                              <Badge
                                key={index}
                                action={
                                  barangay.status === "Complete" ? "success" :
                                    barangay.status === "In Progress" ? "warning" : "muted"
                                }
                              >
                                <BadgeText>
                                  {`${barangay?.barangay_id?.barangay_name}`}
                                </BadgeText>
                              </Badge>
                            ))}
                          </HStack>
                        </ScrollView>
                      )}

                      <Text size="sm">
                        Contact: +63{schedule?.truck?.user?.contact_number || "N/A"}
                      </Text>
                    </VStack>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </VStack>

        {/* Selected Schedule Modal */}
        {selectedSchedule && (
          <>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                zIndex: 998,
              }}
              activeOpacity={1}
              onPress={() => setSelectedSchedule(null)}
            />

            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg="$white"
              borderTopLeftRadius="$xl"
              borderTopRightRadius="$xl"
              shadowColor="$black"
              shadowOffset={{ width: 0, height: -2 }}
              shadowOpacity={0.3}
              shadowRadius={20}
              elevation={20}
              p="$4"
              maxHeight="100%"
              zIndex={999}
              mb="$20"
            >
              <VStack space="md">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text size="lg" fontWeight="$bold">Schedule Details</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedSchedule(null)}
                    style={{
                      padding: 8,
                      backgroundColor: "#f3f4f6",
                      borderRadius: 8
                    }}
                  >
                    <CloseIcon size={20} color="#6b7280" />
                  </TouchableOpacity>
                </HStack>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <VStack space="md">
                    {/* Basic Info */}
                    <VStack space="sm">
                      <HStack justifyContent="space-between">
                        <Text fontWeight="$semibold">Truck ID:</Text>
                        <Text>{selectedSchedule?.truck?.truck_id || "Unknown"}</Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontWeight="$semibold">Status:</Text>
                        <Badge action={selectedSchedule?.truck?.status === "On Route" ? "error" : "success"}>
                          <BadgeText>{selectedSchedule?.truck?.status || "Unknown"}</BadgeText>
                        </Badge>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontWeight="$semibold">Garbage Type:</Text>
                        <Text>{selectedSchedule.garbage_type || "Unknown"}</Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontWeight="$semibold">Schedule Day: </Text>
                        <Text
                          flex={1}        // allows text to use available horizontal space
                          flexWrap="wrap" // allows long text to wrap onto multiple lines
                        >
                          {Array.isArray(selectedSchedule.recurring_day) && selectedSchedule.recurring_day.length > 0
                            ? selectedSchedule.recurring_day
                              .map((day: string) => day.charAt(0).toUpperCase() + day.slice(1))
                              .join(", ")
                            : "-"}
                        </Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontWeight="$semibold">Route Name:</Text>
                        <Text>{selectedSchedule?.route?.route_name || "No Route"}</Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontWeight="$semibold">Polyline Color:</Text>
                        <Box flexDirection="row" alignItems="center">
                          <Box
                            w="$3"
                            h="$3"
                            bg={selectedSchedule?.route?.polyline_color || "#00008B"}
                            mr="$2"
                            borderRadius="$sm"
                          />
                          <Text>{selectedSchedule?.route?.polyline_color || "#00008B"}</Text>
                        </Box>
                      </HStack>
                    </VStack>

                    <Divider />

                    {/* Barangays Covered */}
                    <VStack space="sm">
                      <Text fontWeight="$semibold">
                        Barangays Covered ({selectedSchedule?.task?.length})
                      </Text>
                      {selectedSchedule?.task && Array.isArray(selectedSchedule.task) ? (
                        <VStack space="sm">
                          {selectedSchedule.task.map((barangay: any, index: number) => (
                            <Card key={index} bg="$gray100">
                              <HStack justifyContent="space-between" alignItems="center">
                                <VStack>
                                  <Text fontWeight="$medium">{barangay?.barangay_id?.barangay_name}</Text>
                                  <Text size="sm" color="#6b7280">
                                    Collection Status
                                  </Text>
                                </VStack>
                                <Badge
                                  action={
                                    barangay.status === "Complete" ? "success" :
                                      barangay.status === "In Progress" ? "warning" : "muted"
                                  }
                                >
                                  <BadgeText>
                                    {`${barangay?.status}`}
                                  </BadgeText>
                                </Badge>
                              </HStack>
                            </Card>
                          ))}
                        </VStack>
                      ) : (
                        <Text size="sm" color="#6b7280" fontStyle="italic">
                          No barangays assigned to this route
                        </Text>
                      )}
                    </VStack>

                    <Divider />

                    {/* Route Points */}
                    <VStack space="sm">
                      <Text fontWeight="$semibold">
                        Route Points ({getRoutePoints(selectedSchedule).length})
                      </Text>
                      {getRoutePoints(selectedSchedule).length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <HStack space="sm">
                            {getRoutePoints(selectedSchedule).map((point: any, index: number) => (
                              <Card key={index} size="sm" bg="$gray100">
                                <VStack space="xs">
                                  <Text size="xs" fontWeight="$medium">Point {index + 1}</Text>
                                  <Text size="xs">
                                    {point.lat?.toFixed(6) || "N/A"}, {point.lng?.toFixed(6) || "N/A"}
                                  </Text>
                                </VStack>
                              </Card>
                            ))}
                          </HStack>
                        </ScrollView>
                      ) : (
                        <Text size="sm" color="#6b7280" fontStyle="italic">
                          No route points defined for this schedule
                        </Text>
                      )}
                    </VStack>

                    {/* Driver Info */}
                    {selectedSchedule?.truck?.user && (
                      <>
                        <Divider />
                        <VStack space="sm">
                          <Text fontWeight="$semibold">Driver Information</Text>
                          <Card bg="$gray100">
                            <VStack space="xs">
                              <HStack justifyContent="space-between">
                                <Text>Name:</Text>
                                <Text>{formatDriverName(selectedSchedule.truck.user)}</Text>
                              </HStack>
                              <HStack justifyContent="space-between">
                                <Text>Contact:</Text>
                                <Text>+63{selectedSchedule.truck.user.contact_number}</Text>
                              </HStack>
                              <HStack justifyContent="space-between">
                                <Text>Gender:</Text>
                                <Text>
                                  {selectedSchedule.truck.user.gender?.charAt(0).toUpperCase() +
                                    selectedSchedule.truck.user.gender?.slice(1) || "Not specified"}
                                </Text>
                              </HStack>
                            </VStack>
                          </Card>
                        </VStack>
                      </>
                    )}
                  </VStack>
                </ScrollView>
              </VStack>
            </Box>
          </>
        )}

        {/* Legend */}
        {/* <Card bg="$gray100">
          <VStack space="sm">
            <Text fontWeight="$bold" size="sm">Map Legend</Text>
            <HStack space="sm" alignItems="center">
              <Box w="$3" h="$3" bg="$red500" rounded="$sm" />
              <Text size="sm">On Route (Truck Status)</Text>
            </HStack>
            <HStack space="sm" alignItems="center">
              <Box w="$3" h="$3" bg="$green500" rounded="$sm" />
              <Text size="sm">Available (Truck Status)</Text>
            </HStack>
            <HStack space="sm" alignItems="center">
              <Box
                w="$3"
                h="$3"
                bg={selectedSchedule?.route?.polyline_color || "#00008B"}
                rounded="$sm"
              />
              <Text size="sm">Route Path</Text>
              <Text size="sm" color="#6b7280">
                ({selectedSchedule?.route?.polyline_color || "#00008B"})
              </Text>
            </HStack>
            <Text size="xs" color="#6b7280"mt="$1">
              All routes are displayed on the map with their assigned colors
            </Text>
          </VStack>
        </Card> */}
      </VStack>
    </ScrollView>
  );
}