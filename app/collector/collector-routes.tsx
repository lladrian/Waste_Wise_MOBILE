import {
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonText,
  Card,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  HStack,
  ScrollView,
  Text,
  VStack,
  Modal,
  ModalBackdrop,
  ModalContent,
  Pressable,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@gluestack-ui/themed";
import { Check, MapPin, Navigation, Eye, EyeOff } from "lucide-react-native";
import React, { useState, useContext, useEffect } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { AuthContext } from "@/context/AuthContext";
import { useLocation } from '@/context/LocationContext';

import { getTodayScheduleSpecificUser, updateScheduleCollectionStatus } from "../../hooks/schedule_hook";
import { useFocusEffect } from "@react-navigation/native";

export interface ScheduleData {
  _id: string;
  [key: string]: any;
}

interface CollectionArea {
  id: string;
  name: string;
  completed: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  estimatedTime: string;
  garbageSites: number;
  taskId: string;
  barangayId: string;
  scheduleId: string;
  originalStatus: string;
  showSites?: boolean; // New property for individual barangay site visibility
}

interface GarbageSite {
  _id: string;
  garbage_site_name: string;
  barangay: string;
  position: {
    lat: number;
    lng: number;
  };
  created_at: string;
  __v: number;
}

interface TaskUpdate {
  task_id: string;
  status: "Complete" | "Pending";
}


type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
};

export default function CollectorRoutesScreen() {
  const { user } = useContext(AuthContext)!;
  const [areas, setAreas] = useState<CollectionArea[]>([]);
  const [garbageSites, setGarbageSites] = useState<GarbageSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [showAllGarbageSites, setShowAllGarbageSites] = useState(true); // Global toggle for all sites
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const { location, connectWebSocket, fetchTodayScheduleRecords } = useLocation();

  useEffect(() => {
    if (location) {
      setUserLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        // accuracy: location.accuracy,
        // accuracy: 0,
        // timestamp: location.timestamp,
      });
    }
  }, [location]); // This will run every time location changes


  useFocusEffect(
    React.useCallback(() => {
      fetchTodaySchedule();
      connectWebSocket();
      fetchTodayScheduleRecords();
    }, [])
  );

  // Helper function to extract and flatten garbage sites
  const extractGarbageSites = (garbageSitesData: any[]): GarbageSite[] => {
    if (!garbageSitesData || !Array.isArray(garbageSitesData)) return [];

    const sites: GarbageSite[] = [];

    garbageSitesData.forEach(item => {
      if (Array.isArray(item)) {
        // If it's an array of sites, add all of them
        item.forEach(site => {
          if (site && site.position) {
            sites.push(site);
          }
        });
      } else if (item && typeof item === 'object' && item.position) {
        // If it's a single site object
        sites.push(item);
      }
    });

    return sites;
  };

  // Helper function to get garbage sites for a specific barangay
  const getGarbageSitesByBarangay = (barangayId: string): GarbageSite[] => {
    return garbageSites.filter(site => site.barangay === barangayId);
  };

  const fetchTodaySchedule = async () => {
    try {
      setLoading(true);
      const scheduleData = await getTodayScheduleSpecificUser(user?._id || "");

      if (scheduleData?.data?.data?.[0]) {
        const schedule = scheduleData?.data?.data[0];
        
        // Extract and set all garbage sites
        const allGarbageSites = extractGarbageSites(schedule.garbage_sites);
        setGarbageSites(allGarbageSites);

        const mappedAreas = schedule.task.map((task: any, index: number) => {
          const barangayId = task.barangay_id._id;
          const barangayGarbageSites = getGarbageSitesByBarangay(barangayId);
          const garbageSitesCount = barangayGarbageSites.length;

          // Calculate average coordinates for the barangay from its garbage sites
          let coordinates = { latitude: 11.0147, longitude: 124.6075 }; // Default coordinates

          if (barangayGarbageSites.length > 0) {
            const totalLat = barangayGarbageSites.reduce((sum, site) => sum + site.position.lat, 0);
            const totalLng = barangayGarbageSites.reduce((sum, site) => sum + site.position.lng, 0);
            coordinates = {
              latitude: totalLat / barangayGarbageSites.length,
              longitude: totalLng / barangayGarbageSites.length
            };
          }

          return {
            id: task._id,
            name: task.barangay_id.barangay_name,
            completed: task.status === "Complete",
            coordinates: coordinates,
            estimatedTime: "30 min", // Default estimated time
            garbageSites: garbageSitesCount,
            taskId: task._id,
            barangayId: barangayId,
            scheduleId: schedule._id,
            originalStatus: task.status,
            showSites: true // Default to showing sites for each barangay
          };
        });

        setSchedule(schedule)
        setAreas(mappedAreas);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleCheckboxChange = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return;

    const newCompleted = !area.completed;
    
    // Update local state immediately for responsive UI
    setAreas(prev =>
      prev.map(a =>
        a.id === areaId ? { ...a, completed: newCompleted } : a
      )
    );

    // Call API to update status immediately
    handleUpdateStatus(areaId, newCompleted);
  };

  const handleUpdateStatus = async (areaId: string, completed: boolean) => {
    try {
      const taskUpdates: TaskUpdate[] = [{
        task_id: areaId,
        status: completed ? "Complete" : "Pending"
      }];

      const updateData = {
        task_updates: taskUpdates
      };

      await updateScheduleCollectionStatus(schedule?._id || "", updateData);

      // Update originalStatus after successful API call
      setAreas(prevAreas =>
        prevAreas.map(area =>
          area.id === areaId
            ? { ...area, originalStatus: completed ? "Complete" : "Pending" }
            : area
        )
      );

    } catch (error) {
      console.error("Error updating task status:", error);
      // Revert the change if API call fails
      setAreas(prev =>
        prev.map(a =>
          a.id === areaId ? { ...a, completed: !completed } : a
        )
      );
    }
  };

  // Toggle site visibility for a specific barangay
  const handleSiteVisibilityChange = (areaId: string) => {
    setAreas(prev =>
      prev.map(area =>
        area.id === areaId 
          ? { ...area, showSites: !area.showSites }
          : area
      )
    );
  };

  // Toggle all garbage sites visibility
  const toggleAllGarbageSitesVisibility = () => {
    const newVisibility = !showAllGarbageSites;
    setShowAllGarbageSites(newVisibility);
    
    // Update all individual barangay site visibilities
    setAreas(prev =>
      prev.map(area => ({
        ...area,
        showSites: newVisibility
      }))
    );
  };

  const handleCardPress = (areaId: string) => {
    handleCheckboxChange(areaId);
  };

  const completedAreas = areas.filter(area => area.completed).length;
  const totalAreas = areas.length;

  // Get visible garbage sites based on global and individual settings
  const getVisibleGarbageSites = (): GarbageSite[] => {
    if (!showAllGarbageSites) return [];

    return garbageSites.filter(site => {
      const area = areas.find(area => area.barangayId === site.barangay);
      return area?.showSites !== false;
    });
  };

  const visibleGarbageSites = getVisibleGarbageSites();

  if (loading) {
    return (
      <ScrollView flex={1} bg="$white">
        <VStack space="lg" p="$4" alignItems="center">
          <Text>Loading collection routes...</Text>
        </VStack>
      </ScrollView>
    );
  }

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        <Box>
          <Text size="xl" fontWeight="$bold">
            Collection Routes
          </Text>
          <Text color="$secondary500">
            {completedAreas}/{totalAreas} areas completed
          </Text>
        </Box>

        {/* Progress Summary */}
        <Card>
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontWeight="$bold">Today&apos;s Progress</Text>
              <Badge
                action={completedAreas === totalAreas ? "success" : "info"}
              >
                <BadgeText>
                  {completedAreas === totalAreas ? "Completed" : "In Progress"}
                </BadgeText>
              </Badge>
            </HStack>
            <Text color="$secondary500">
              Complete your assigned areas and mark them as done
            </Text>
          </VStack>
        </Card>

        {/* Map View */}
        {(areas.length > 0 || garbageSites.length > 0) && (
          <Box>
            {/* Map Controls */}
            <Card mb="$2" p="$3">
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="$bold">Map Controls</Text>
                <HStack space="md" alignItems="center">
                  {/* Toggle All Garbage Sites Visibility */}
                  <Pressable onPress={toggleAllGarbageSitesVisibility}>
                    <HStack space="sm" alignItems="center">
                      {showAllGarbageSites ? (
                        <Eye size={18} color="#3B82F6" />
                      ) : (
                        <EyeOff size={18} color="#6B7280" />
                      )}
                      <Text 
                        size="sm" 
                        color={showAllGarbageSites ? "#3B82F6" : "#6B7280"}
                        fontWeight="$medium"
                      >
                        {showAllGarbageSites ? "Hide All Sites" : "Show All Sites"}
                      </Text>
                    </HStack>
                  </Pressable>
                </HStack>
              </HStack>
              
              {/* Map Legend */}
              <HStack space="md" mt="$2" flexWrap="wrap">
                <HStack space="xs" alignItems="center">
                  <Box w={12} h={12} bg="$blue500" borderRadius="$sm" />
                  <Text size="xs">Garbage Site</Text>
                </HStack>
                {/* <HStack space="xs" alignItems="center">
                  <Box w={12} h={12} borderWidth={2} borderColor="#3B82F6" borderRadius="$sm" />
                  <Text size="xs">Collection Route</Text>
                </HStack> */}
              </HStack>
            </Card>

            {/* Map Container */}
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

                showsCompass={true}
                showsScale={true}
                showsBuildings={true}
                showsTraffic={false}
              >
                  {/* <Marker
                    coordinate={{
                      latitude: 11.099144436997905,
                      longitude: 124.556244988605
                    }}
                    title={`GT101`}
                    description={`Garbage Collector`}
                    pinColor="red"
                  /> */}

                {userLocation && (
                  <Marker
                    coordinate={userLocation}
                    title="GT101"
                    description="Garbage Collector"
                    pinColor="red"
                  />
                )}

                {/* Markers for individual garbage sites - conditionally rendered */}
                {visibleGarbageSites.map((site, index) => (
                  <Marker
                    key={`site-${site._id}-${index}`}
                    coordinate={{
                      latitude: site.position.lat,
                      longitude: site.position.lng
                    }}
                    title={site.garbage_site_name}
                    description={`Garbage Site`}
                    pinColor="blue"
                  />
                ))}
              </MapView>
            </Box>
          </Box>
        )}

        {/* Garbage Sites Summary */}
        {garbageSites.length > 0 && (
          <Card>
            <VStack space="sm">
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="$bold">Garbage Sites</Text>
                <Badge action={showAllGarbageSites ? "info" : "muted"}>
                  <BadgeText>
                    {showAllGarbageSites ? `${visibleGarbageSites.length} Visible` : "All Hidden"}
                  </BadgeText>
                </Badge>
              </HStack>
              <Text color="$secondary500">
                Total: {garbageSites.length} sites across {areas.length} areas
              </Text>
              <HStack space="sm" alignItems="center" mt="$1">
                <Text size="sm" color="$secondary500">
                  Status:
                </Text>
                <Text size="sm" color={showAllGarbageSites ? "$success500" : "$secondary500"}>
                  {showAllGarbageSites ? `${visibleGarbageSites.length} showing on map` : "All hidden from map"}
                </Text>
              </HStack>
            </VStack>
          </Card>
        )}

        {/* Areas List */}
        <VStack space="md">
          <HStack justifyContent="space-between" alignItems="center">
            <Text size="lg" fontWeight="$bold">
              Assigned Areas
            </Text>
            {garbageSites.length > 0 && (
              <Pressable onPress={toggleAllGarbageSitesVisibility}>
                <HStack space="sm" alignItems="center">
                  {showAllGarbageSites ? (
                    <Eye size={16} color="#3B82F6" />
                  ) : (
                    <EyeOff size={16} color="#6B7280" />
                  )}
                  <Text 
                    size="sm" 
                    color={showAllGarbageSites ? "#3B82F6" : "#6B7280"}
                  >
                    {showAllGarbageSites ? "All Shown" : "All Hidden"}
                  </Text>
                </HStack>
              </Pressable>
            )}
          </HStack>

          {areas.length === 0 ? (
            <Card>
              <Text textAlign="center" color="$secondary500">
                No collection areas assigned for today.
              </Text>
            </Card>
          ) : (
            areas.map((area) => {
              const displayStatus = area.completed ? "Complete" : "Pending";
              const areaGarbageSites = getGarbageSitesByBarangay(area.barangayId);
              const visibleAreaSites = areaGarbageSites.filter(site => 
                showAllGarbageSites && area.showSites
              );

              return (
                <Pressable key={area.id} onPress={() => handleCheckboxChange(area.id)}>
                  <Card>
                    <HStack space="md" alignItems="flex-start">
                      {/* Completion Checkbox */}
                      <VStack space="sm" alignItems="center">
                        <Checkbox 
                          value={area.completed ? "true" : "false"}
                          isChecked={area.completed}
                          onChange={() => handleCheckboxChange(area.id)}
                          aria-label={`Mark ${area.name} as ${area.completed ? "pending" : "complete"}`}
                        >
                          <CheckboxIndicator>
                            <CheckboxIcon as={Check} />
                          </CheckboxIndicator>
                        </Checkbox>
                        
                        {/* Site Visibility Checkbox */}
                        {areaGarbageSites.length > 0 && (
                          <Pressable 
                            onPress={() => handleSiteVisibilityChange(area.id)}
                            hitSlop={8}
                          >
                            <Box p="$1" borderRadius="$sm" bg={area.showSites ? "$blue50" : "transparent"}>
                              {area.showSites ? (
                                <Eye size={16} color="#3B82F6" />
                              ) : (
                                <EyeOff size={16} color="#6B7280" />
                              )}
                            </Box>
                          </Pressable>
                        )}
                      </VStack>

                      {/* Area Details */}
                      <VStack flex={1} space="xs">
                        <HStack justifyContent="space-between" alignItems="center">
                          <Box flex={1} mr="$2">
                            <Text fontWeight="$bold" numberOfLines={1} ellipsizeMode="tail">
                              {area.name}
                            </Text>
                          </Box>

                          <HStack space="sm" alignItems="center" flexShrink={0}>
                            <Badge
                              size="sm"
                              action={displayStatus === "Complete" ? "success" : "error"}
                            >
                              <BadgeText>
                                {displayStatus === "Complete" ? "Completed" : "Pending"}
                              </BadgeText>
                            </Badge>
                          </HStack>
                        </HStack>

                        <HStack space="md">
                          <HStack space="xs" alignItems="center">
                            <MapPin size={14} color="#6B7280" />
                            <Text size="sm" color="$secondary500">
                              {area.garbageSites} Garbage Sites
                            </Text>
                          </HStack>

                          {/* <HStack space="xs" alignItems="center">
                            <Navigation size={14} color="#6B7280" />
                            <Text size="sm" color="$secondary500">
                              {area.estimatedTime}
                            </Text>
                          </HStack> */}
                        </HStack>

                        {/* Show garbage site names for this area */}
                        {areaGarbageSites.length > 0 && (
                          <VStack space="xs" mt="$2">
                            <HStack justifyContent="space-between" alignItems="center">
                              <Text size="sm" fontWeight="$medium">
                                Sites ({visibleAreaSites.length}/{areaGarbageSites.length}):
                              </Text>
                              <Badge 
                                size="sm" 
                                action={area.showSites && showAllGarbageSites ? "info" : "muted"}
                              >
                                <BadgeText>
                                  {area.showSites && showAllGarbageSites ? "Visible" : "Hidden"}
                                </BadgeText>
                              </Badge>
                            </HStack>
                            <Text size="sm" color="$secondary500">
                              {areaGarbageSites.map(site => site.garbage_site_name).join(', ')}
                            </Text>
                          </VStack>
                        )}
                      </VStack>
                    </HStack>
                  </Card>
                </Pressable>
              );
            })
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
}