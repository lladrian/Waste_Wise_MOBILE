import React, { useEffect, useState, useContext, useRef } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import {
  Card,
  HStack,
  VStack,
  useToast,
  Badge,
  BadgeText,
  Text as GSText,
  Box,
  Button,
  ButtonText,
  Icon,
  CheckCircleIcon,
} from "@gluestack-ui/themed";
import { Bell, CheckCircle2, AlertCircle, ChevronRight, CheckCheck } from "lucide-react-native";
import { useRouter } from "expo-router";
import { AppToast } from "@/components/ui/AppToast";

import { getAllNotificationSpecificUser, updateReadSpecificNotification, updateReadAllNotificationSpecificUser } from "../hooks/notification_hook";
import { useFocusEffect } from "@react-navigation/native";

import { AuthContext } from "@/context/AuthContext";

export interface NotificationData {
  _id: string;
  notif_content: string;
  title: string;
  category: string;
  link: string;
  is_read: boolean;
  created_at: string;
  [key: string]: any;
}

export default function NotificationScreen() {
  const { user } = useContext(AuthContext)!;
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const toast = useToast();

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const fetchNotifications = async () => {
    try {
      const { data, success } = await getAllNotificationSpecificUser(
        user?._id || "",
        user?.role || ""
        // "691ed43951aaec0452abbbeb",
        // "admin"
      );



      if (success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.log(error);
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Error"
            description="Failed to load notifications."
          />
        ),
      });
    }
  };

  const handleNotificationPress = async (notification: NotificationData) => {
    if (notification.link) {
      const { data, success } = await updateReadSpecificNotification(notification?._id);
      if (success === true) {
        fetchNotifications();
        router.push(notification.link as any);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?._id) return;

    setIsMarkingAllAsRead(true);
    try {
      const { data, success } = await updateReadAllNotificationSpecificUser(user._id);
      // const { data, success } = await updateReadAllNotificationSpecificUser("691ed43951aaec0452abbbeb");

      if (success) {
        fetchNotifications();
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="success"
              title="Success"
              description="All notifications marked as read."
            />
          ),
        });
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Error"
            description="Failed to mark all notifications as read."
          />
        ),
      });
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };

  const getCategoryIcon = (category: string) =>
    <Bell size={16} color="#6B7280" />;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "garbage_report":
        return "#FEF3C7";
      case "schedule":
        return "#D1FAE5";
      case "account_request":
        return "#F3E8FF";
      default:
        return "#F3F4F6";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if there are any unread notifications
  const hasUnreadNotifications = notifications.some(notif => !notif.is_read);

  return (
    <VStack flex={1} bg="$backgroundLight50">
      {/* Header with Mark All as Read button */}
      {hasUnreadNotifications && notifications.length > 0 && (
        <HStack
          justifyContent="flex-end"
          alignItems="center"
          p="$4"
          bg="$white"
          borderBottomWidth={1}
          borderBottomColor="$secondary200"
        >
          <Button
            size="sm"
            variant="outline"
            action="primary"
            isDisabled={isMarkingAllAsRead}
            onPress={handleMarkAllAsRead}
          >
            {isMarkingAllAsRead ? (
              <ButtonText>Processing...</ButtonText>
            ) : (
              <>
                <CheckCheck size={16} style={{ marginRight: 8 }} />
                <ButtonText>Mark All as Read</ButtonText>
              </>
            )}
          </Button>
        </HStack>
      )}

      {/* Notifications List */}
      <ScrollView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        <VStack space="md" p="$4">
          {notifications.length === 0 ? (
            <Card p="$8" alignItems="center" bg="$white">
              <Bell size={48} color="#9CA3AF" />
              <GSText mt="$4" color="$secondary500">
                No notifications available
              </GSText>
            </Card>
          ) : (
            notifications.map((notif) => (
              <TouchableOpacity
                key={notif._id}
                onPress={() => handleNotificationPress(notif)}
                activeOpacity={0.7}
                style={{ marginBottom: 12 }}
              >
                <Card
                  p="$4"
                  borderWidth={1}
                  borderColor={notif.is_read ? "$secondary200" : "$blue200"}
                  bg="$white"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: notif.is_read ? "#D1D5DB" : "#3B82F6",
                    elevation: 2,
                  }}
                >
                  <HStack justifyContent="space-between" alignItems="flex-start">
                    <HStack space="sm" alignItems="center" flex={1}>
                      <Box
                        p="$2"
                        rounded="$lg"
                        style={{ backgroundColor: getCategoryColor(notif.category) }}
                      >
                        {getCategoryIcon(notif.category)}
                      </Box>

                      <VStack flex={1}>
                        <HStack alignItems="center" space="xs">
                          <GSText size="md" fontWeight="$bold" color="$secondary800" flex={1}>
                            {notif.title}
                          </GSText>

                          {!notif.is_read && (
                            <Box w="$2" h="$2" bg="$blue500" rounded="$full" />
                          )}
                        </HStack>

                        <GSText mt="$1" size="sm" color="$secondary600">
                          {notif.notif_content}
                        </GSText>
                      </VStack>
                    </HStack>

                    <ChevronRight size={20} color="#9CA3AF" />
                  </HStack>

                  <HStack mt="$3" justifyContent="space-between" alignItems="center">
                    <HStack alignItems="center" space="sm">
                      <Badge size="sm" action="muted" bg="$primary100" borderColor="$primary300">
                        <BadgeText color="$primary700" size="xs">
                          {notif.category.replace("_", " ").toUpperCase()}
                        </BadgeText>
                      </Badge>

                      {notif.is_read ? (
                        <HStack alignItems="center" space="xs">
                          <CheckCircle2 size={14} color="#16A34A" />
                          <GSText size="xs" color="$secondary500">
                            Read
                          </GSText>
                        </HStack>
                      ) : (
                        <HStack alignItems="center" space="xs">
                          <AlertCircle size={14} color="#DC2626" />
                          <GSText size="xs" color="$secondary500">
                            Unread
                          </GSText>
                        </HStack>
                      )}
                    </HStack>

                    <GSText size="xs" color="$secondary500">
                      {formatDate(notif.created_at)}
                    </GSText>
                  </HStack>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </VStack>
      </ScrollView>
    </VStack>
  );
}