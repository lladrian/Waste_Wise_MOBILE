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
  useToast,
  VStack,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Icon,
  CloseIcon,
} from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import { Truck, Calendar, MapPin, User, Info, Trash } from "lucide-react-native";
import { Loader } from "../../components/ui/Loader";
import { AuthContext } from "@/context/AuthContext";
import { AppToast } from "@/components/ui/AppToast";
import React, { useContext, useEffect, useState } from "react";
import { getAllScheduleSpecificUser } from "../../hooks/schedule_hook";
import { useFocusEffect } from "@react-navigation/native";
import { Pressable } from "react-native";
import { useLocation } from '@/context/LocationContext';


export interface ScheduleData {
  _id: string;
  [key: string]: any;
}

export default function CollectorSchedule() {
  const { user } = useContext(AuthContext)!;
  const router = useRouter();
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [today_schedules, setTodaySchedules] = useState<ScheduleData[]>([]);
  const [upcomming_schedules, setUpcommingSchedules] = useState<ScheduleData[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { connectWebSocket, fetchTodayScheduleRecords } = useLocation();
  

  const toast = useToast();

  useFocusEffect(
    React.useCallback(() => {
      fetchSchedules();
      connectWebSocket();
      fetchTodayScheduleRecords();
    }, [])
  );

  const fetchSchedules = async () => {
    try {
      const { data, success } = await getAllScheduleSpecificUser(
        user?._id || ""
      );
      if (success === true) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySchedulesData = data.data.filter((schedule: any) => {
          const scheduleDate = new Date(schedule.scheduled_collection);
          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate.getTime() === today.getTime();
        });

        const upcomingSchedulesData = data.data.filter((schedule: any) => {
          const scheduleDate = new Date(schedule.scheduled_collection);
          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate.getTime() > today.getTime();
        });

        setSchedules(data.data);
        setTodaySchedules(todaySchedulesData);
        setUpcommingSchedules(upcomingSchedulesData);
      }
    } catch (error) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Error"
            description="Failed to load schedules."
          />
        ),
      });
    }
  };

  const handleSchedulePress = (schedule: ScheduleData) => {
    setSelectedSchedule(schedule);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSchedule(null);
  };

  const handleTrackTruck = (schedule: ScheduleData) => {
    handleCloseModal();
    // Navigate to tracking screen
    // router.push({
    //   pathname: "/tracking",
    //   params: {
    //     scheduleId: schedule._id,
    //     truckId: schedule.truck?._id
    //   }
    // });
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Date not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColors = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return { bg: "$green100", text: "$green600" };
      case "pending":
        return { bg: "$yellow100", text: "$yellow600" };
      case "completed":
        return { bg: "$blue100", text: "$blue600" };
      case "cancelled":
        return { bg: "$red100", text: "$red600" };
      case "in progress":
        return { bg: "$purple100", text: "$purple600" };
      default:
        return { bg: "$gray100", text: "$gray600" };
    }
  };

  const formatText = (text: string | undefined): string => {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Box flex={1} bg="$white">
      <ScrollView flex={1} mb="$1">
        <VStack space="lg" p="$4" pb="$10">
          <Box>
            <Text size="xl" fontWeight="$bold">
              Collection Schedule
            </Text>
            <Text color="$secondary500">{user?.barangay?.barangay_name}</Text>
          </Box>

          {/* Collections Today */}
          {today_schedules.length >= 0 && (
            <VStack space="md">
              <Text fontWeight="$bold" color="$secondary500" size="sm">
                COLLECTIONS TODAY ({today_schedules.length})
              </Text>
              {today_schedules.map((schedule) => (
                <Pressable
                  key={schedule?._id}
                  onPress={() => handleSchedulePress(schedule)}
                >
                  <Card p="$3">
                    <HStack
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <VStack space="xs" flex={1}>
                        <HStack
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text fontWeight="$bold">
                            {getDayName(schedule?.scheduled_collection)}
                          </Text>
                        </HStack>
                        <Text color="$secondary500" size="sm">
                          {formatDate(schedule?.scheduled_collection)}
                        </Text>
                        <HStack space="sm" alignItems="center">
                          <Text
                            size="sm"
                            color="$primary500"
                            fontWeight="$bold"
                          >
                            {schedule?.garbage_type}
                          </Text>
                          <Text size="sm" color="$secondary500">
                            • {schedule?.truck?.truck_id}
                          </Text>
                        </HStack>
                      </VStack>
                      <Badge
                        bg={getStatusColors(schedule?.status).bg}
                        rounded="$full"
                      >
                        <BadgeText
                          color={getStatusColors(schedule?.status).text}
                          size="xs"
                        >
                          {schedule?.status}
                        </BadgeText>
                      </Badge>
                    </HStack>
                    {schedule?.truck?.status === "On Route" && (
                      <Button
                        variant="link"
                        action="primary"
                        size="sm"
                        alignSelf="flex-start"
                        onPress={() => handleTrackTruck(schedule)}
                      >
                        <HStack space="xs" alignItems="center">
                          <Truck size={14} color="#0066CC" />
                          <ButtonText size="sm">Track</ButtonText>
                        </HStack>
                      </Button>
                    )}
                  </Card>
                </Pressable>
              ))}
            </VStack>
          )}

          {/* Upcoming Collections */}
          {upcomming_schedules.length >= 0 && (
            <VStack space="md">
              <Text fontWeight="$bold" color="$secondary500" size="sm">
                UPCOMING COLLECTIONS ({upcomming_schedules.length})
              </Text>
              {upcomming_schedules.map((schedule) => (
                <Pressable
                  key={schedule?._id}
                  onPress={() => handleSchedulePress(schedule)}
                >
                  <Card p="$3">
                    <HStack
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <VStack space="xs" flex={1}>
                        <HStack
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text fontWeight="$bold">
                            {getDayName(schedule?.scheduled_collection)}
                          </Text>
                        </HStack>
                        <Text color="$secondary500" size="sm">
                          {formatDate(schedule?.scheduled_collection)}
                        </Text>
                        <HStack space="sm" alignItems="center">
                          <Text
                            size="sm"
                            color="$primary500"
                            fontWeight="$bold"
                          >
                            {schedule?.garbage_type}
                          </Text>
                          <Text size="sm" color="$secondary500">
                            • {schedule?.truck?.truck_id}
                          </Text>
                        </HStack>
                      </VStack>
                      <Badge
                        bg={getStatusColors(schedule?.status).bg}
                        rounded="$full"
                      >
                        <BadgeText
                          color={getStatusColors(schedule?.status).text}
                          size="xs"
                        >
                          {schedule?.status}
                        </BadgeText>
                      </Badge>
                    </HStack>
                  </Card>
                </Pressable>
              ))}
            </VStack>
          )}

          {/* All Schedules */}
          {schedules.length >= 0 && (
            <VStack space="md">
              <Text fontWeight="$bold" color="$secondary500" size="sm">
                ALL SCHEDULES ({schedules.length})
              </Text>
              {schedules.map((schedule) => (
                <Pressable
                  key={schedule?._id}
                  onPress={() => handleSchedulePress(schedule)}
                >
                  <Card p="$3">
                    <HStack
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <VStack space="xs" flex={1}>
                        <HStack
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text fontWeight="$bold">
                            {getDayName(schedule?.scheduled_collection)}
                          </Text>
                        </HStack>
                        <Text color="$secondary500" size="sm">
                          {formatDate(schedule?.scheduled_collection)}
                        </Text>
                        <HStack space="sm" alignItems="center">
                          <Text
                            size="sm"
                            color="$primary500"
                            fontWeight="$bold"
                          >
                            {schedule?.garbage_type}
                          </Text>
                          <Text size="sm" color="$secondary500">
                            • {schedule?.truck?.truck_id}
                          </Text>
                        </HStack>
                      </VStack>
                      <Badge
                        bg={getStatusColors(schedule?.status).bg}
                        rounded="$full"
                      >
                        <BadgeText
                          color={getStatusColors(schedule?.status).text}
                          size="xs"
                        >
                          {schedule?.status}
                        </BadgeText>
                      </Badge>
                    </HStack>
                  </Card>
                </Pressable>
              ))}
            </VStack>
          )}

          {/* Show message when no schedules */}
          {schedules.length === 0 && (
            <Card p="$4" bg="$gray100">
              <Text textAlign="center" color="$secondary500">
                No schedules found
              </Text>
            </Card>
          )}
        </VStack>
      </ScrollView>

      {/* Schedule Details Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} size="full">
        <ModalBackdrop />
        <ModalContent maxHeight="90%" minHeight="85%">
          <ModalHeader>
            <VStack space="xs">
              <Text size="lg" fontWeight="$bold">
                Schedule Details
              </Text>
              <Text size="sm" color="$secondary500">
                Collection Information
              </Text>
            </VStack>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          {/* Make ModalBody scrollable */}
          <ModalBody flex={1}>
            <ScrollView
              flex={1}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {selectedSchedule && (
                <VStack space="lg" pb="$4">
                  {/* Schedule Info */}
                  <VStack space="md">
                    <HStack space="sm" alignItems="center">
                      <Calendar size={18} color="#666" />
                      <Text fontWeight="$bold" size="md">
                        Schedule Information
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text color="$secondary500">Date:</Text>
                      <Text fontWeight="$medium">
                        {formatDate(selectedSchedule?.scheduled_collection)}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text color="$secondary500">Day:</Text>
                      <Text fontWeight="$medium">
                        {getDayName(selectedSchedule?.scheduled_collection)}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text color="$secondary500">Garbage Type:</Text>
                      <Text fontWeight="$medium">
                        {selectedSchedule?.garbage_type}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text color="$secondary500">Status:</Text>
                      <Badge
                        bg={getStatusColors(selectedSchedule?.status).bg}
                        rounded="$full"
                      >
                        <BadgeText
                          color={getStatusColors(selectedSchedule?.status).text}
                          size="xs"
                        >
                          {formatText(selectedSchedule?.status)}
                        </BadgeText>
                      </Badge>
                    </HStack>
                  </VStack>

                  {/* Route Info */}
                  <VStack space="md">
                    <HStack space="sm" alignItems="center">
                      <MapPin size={18} color="#666" />
                      <Text fontWeight="$bold" size="md">
                        Route Information
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text color="$secondary500">Route:</Text>
                      <Text fontWeight="$medium">
                        {selectedSchedule?.route?.route_name}
                      </Text>
                    </HStack>
                    <VStack space="md">
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <Text color="$secondary500">Barangays Covered:</Text>
                      </HStack>
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <VStack
                          space="xs"
                          alignItems="flex-start"
                          flex={1}
                          maxWidth="100%"
                        >
                          {selectedSchedule?.task?.map(
                            (barangay: any, index: number) => (
                              <HStack
                                key={barangay._id}
                                space="sm"
                                alignItems="center"
                                width="$full"
                              >
                                <Text color="$primary500">•</Text>
                                <Text
                                  fontWeight="$medium"
                                  flex={1}
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                >
                                  {barangay.barangay_id?.barangay_name}
                                </Text>
                                <Box
                                  bg={barangay.status === 'Completed' ? '$green500' :
                                    barangay.status === 'Pending' ? '$yellow500' : '$gray500'}
                                  px="$2"
                                  py="$1"
                                  borderRadius="$md"
                                >
                                  <Text
                                    color="$white"
                                    fontSize="$xs"
                                    fontWeight="$bold"
                                    textTransform="capitalize"
                                  >
                                    {barangay.status}
                                  </Text>
                                </Box>
                              </HStack>
                            )
                          )}
                        </VStack>
                      </HStack>
                    </VStack>
                  </VStack>

                  {/* Truck Info */}
                  <VStack space="md">
                    <HStack space="sm" alignItems="center">
                      <Truck size={18} color="#666" />
                      <Text fontWeight="$bold" size="md">
                        Truck Information
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text color="$secondary500">Truck ID:</Text>
                      <Text fontWeight="$medium">
                        {selectedSchedule?.truck?.truck_id}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text color="$secondary500">Truck Status:</Text>
                      <Text fontWeight="$medium">
                        {formatText(selectedSchedule?.truck?.status)}
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Driver Info */}
                  <VStack space="md">
                    <HStack space="sm" alignItems="center">
                      <User size={18} color="#666" />
                      <Text fontWeight="$bold" size="md">
                        Driver Information
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text color="$secondary500">Driver:</Text>
                      <Text fontWeight="$medium">
                        {selectedSchedule?.truck?.user?.first_name}{" "}
                        {selectedSchedule?.truck?.user?.last_name}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text color="$secondary500">Contact:</Text>
                      <Text fontWeight="$medium">
                        +63{selectedSchedule?.truck?.user?.contact_number}
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Additional Info (uncomment if needed) */}
                  {/* <VStack space="md">
              <HStack space="sm" alignItems="center">
                <Info size={18} color="#666" />
                <Text fontWeight="$bold" size="md">Additional Information</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color="$secondary500">Remark:</Text>
                <Text fontWeight="$medium">{selectedSchedule?.remark || "None"}</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color="$secondary500">Created:</Text>
                <Text fontWeight="$medium">{formatDate(selectedSchedule?.created_at)}</Text>
              </HStack>
            </VStack> */}
                </VStack>
              )}
            </ScrollView>
          </ModalBody>
          <ModalFooter>
            <HStack space="sm" flex={1}>
              <Button
                variant="outline"
                action="secondary"
                onPress={handleCloseModal}
                flex={1}
              >
                <ButtonText>Close</ButtonText>
              </Button>
              {selectedSchedule?.truck?.status === "On Route" && (
                <Button
                  onPress={() => handleTrackTruck(selectedSchedule)}
                  flex={1}
                >
                  <HStack space="xs" alignItems="center">
                    <Trash size={16} color="white" />
                    <ButtonText>Track Garbage</ButtonText>
                  </HStack>
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
