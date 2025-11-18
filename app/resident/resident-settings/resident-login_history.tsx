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
import { Calendar, User, Monitor, Smartphone, Info, Clock, CheckCircle, XCircle } from "lucide-react-native";
import { Loader } from "../../../components/ui/Loader";
import { AuthContext } from "@/context/AuthContext";
import { AppToast } from "@/components/ui/AppToast";
import React, { useContext, useEffect, useState } from "react";
import { getAllLoginLogSpecificUser } from "../../../hooks/login_logs_hook";
import { useFocusEffect } from "@react-navigation/native";
import { Pressable } from "react-native";

export interface LoginLogData {
  _id: string;
  user: {
    _id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    contact_number: string;
    role: string;
  };
  os: string;
  device: string;
  platform: string;
  remark: string;
  status: string;
  created_at: string;
  [key: string]: any;
}

export default function ResidentLoginLogsScreen() {
  const { user } = useContext(AuthContext)!;
  const router = useRouter();
  const [loginLogs, setLoginLogs] = useState<LoginLogData[]>([]);
  const [selectedLog, setSelectedLog] = useState<LoginLogData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  useFocusEffect(
    React.useCallback(() => {
      fetchLoginLogs();
    }, [])
  );

  const fetchLoginLogs = async () => {
    try {
      setLoading(true);
      const { data, success } = await getAllLoginLogSpecificUser(
        user?._id || ""
      );
      if (success === true) {
        setLoginLogs(data.data || []);
      }
    } catch (error) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Error"
            description="Failed to load login logs."
          />
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogPress = (log: LoginLogData) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLog(null);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  };

  const getStatusColors = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return { 
          bg: "#dcfce7", 
          text: "#166534", 
          border: "#22c55e",
          iconColor: "#166534",
          icon: CheckCircle 
        };
      case "failed":
        return { 
          bg: "#fecaca", 
          text: "#991b1b", 
          border: "#ef4444",
          iconColor: "#991b1b",
          icon: XCircle 
        };
      default:
        return { 
          bg: "#f3f4f6", 
          text: "#374151", 
          border: "#9ca3af",
          iconColor: "#374151",
          icon: Info 
        };
    }
  };
  
  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case "mobile":
        return Smartphone;
      case "desktop":
        return Monitor;
      default:
        return Monitor;
    }
  };

  const capitalizeFirst = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Box flex={1} bg="$white">
      <ScrollView flex={1} mb="$1">
        <VStack space="lg" p="$4" pb="$10">
          <Box>
            <Text size="xl" fontWeight="$bold">
              Login History
            </Text>
            <Text color="$secondary500">
              Track your account login activities
            </Text>
          </Box>

          {/* Login Logs List */}
          {loginLogs.length > 0 ? (
            <VStack space="md">
              <Text fontWeight="$bold" color="$secondary500" size="sm">
                RECENT LOGINS ({loginLogs.length})
              </Text>
              {loginLogs.map((log) => {
                const StatusIcon = getStatusColors(log.status).icon;
                const DeviceIcon = getDeviceIcon(log.device);
                
                return (
                  <Pressable
                    key={log._id}
                    onPress={() => handleLogPress(log)}
                  >
                    <Card p="$3" sx={{ ":active": { bg: "$gray50" } }}>
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <VStack space="xs" flex={1}>
                          <HStack space="sm" alignItems="center">
                            <DeviceIcon size={16} color="#666" />
                            <Text fontWeight="$bold" size="sm">
                              {capitalizeFirst(log.device)}
                            </Text>
                            <Badge
                              bg={getStatusColors(log.status).bg}
                              rounded="$full"
                              size="sm"
                            >
                              <StatusIcon size={12} color={getStatusColors(log.status).iconColor} />
                              <BadgeText
                                color={getStatusColors(log.status).text}
                                size="xs"
                                ml="$1"
                              >
                                {log.status}
                              </BadgeText>
                            </Badge>
                          </HStack>
                          
                          <Text color="$secondary500" size="sm">
                            {log.remark}
                          </Text>
                          
                          <HStack space="sm" alignItems="center">
                            <Clock size={14} color="#999" />
                            <Text color="$secondary500" size="xs">
                              {formatTimeAgo(log.created_at)}
                            </Text>
                          </HStack>
                          
                          <Text color="$secondary500" size="xs">
                            {formatDateTime(log.created_at)}
                          </Text>
                        </VStack>
                        
                        <Box bg="$primary50" p="$2" rounded="$md">
                          <Calendar size={16} color="#0066CC" />
                        </Box>
                      </HStack>
                    </Card>
                  </Pressable>
                );
              })}
            </VStack>
          ) : (
            <Card p="$4" bg="$gray100" alignItems="center">
              <Text textAlign="center" color="$secondary500">
                No login history found
              </Text>
            </Card>
          )}
        </VStack>
      </ScrollView>

      {/* Login Log Details Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} size="lg">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <VStack space="xs">
              <Text size="lg" fontWeight="$bold">
                Login Details
              </Text>
              <Text size="sm" color="$secondary500">
                Session Information
              </Text>
            </VStack>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          
          <ModalBody>
            {selectedLog && (
              <VStack space="lg">
                {/* Status Section */}
                <VStack space="md">
                  <HStack space="sm" alignItems="center">
                    <Info size={18} color="#666" />
                    <Text fontWeight="$bold" size="md">
                      Login Status
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text color="$secondary500">Status:</Text>
                    <Badge
                      bg={getStatusColors(selectedLog.status).bg}
                      rounded="$full"
                    >
                      <BadgeText color={getStatusColors(selectedLog.status).text}>
                        {selectedLog.status}
                      </BadgeText>
                    </Badge>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text color="$secondary500">Remark:</Text>
                    <Text fontWeight="$medium" textAlign="right">
                      {selectedLog.remark}
                    </Text>
                  </HStack>
                </VStack>

                {/* Device Information */}
                <VStack space="md">
                  <HStack space="sm" alignItems="center">
                    <Monitor size={18} color="#666" />
                    <Text fontWeight="$bold" size="md">
                      Device Information
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text color="$secondary500">Device:</Text>
                    <Text fontWeight="$medium">
                      {capitalizeFirst(selectedLog.device)}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text color="$secondary500">Platform:</Text>
                    <Text fontWeight="$medium">
                      {selectedLog.platform || "Unknown"}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text color="$secondary500">OS:</Text>
                    <Text fontWeight="$medium">
                      {selectedLog.os || "Unknown"}
                    </Text>
                  </HStack>
                </VStack>

                {/* User Information */}
                <VStack space="md">
                  <HStack space="sm" alignItems="center">
                    <User size={18} color="#666" />
                    <Text fontWeight="$bold" size="md">
                      User Information
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text color="$secondary500">Name:</Text>
                    <Text fontWeight="$medium">
                      {selectedLog.user.first_name} {selectedLog.user.last_name}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text color="$secondary500">Email:</Text>
                    <Text fontWeight="$medium">
                      {selectedLog.user.email}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text color="$secondary500">Role:</Text>
                    <Text fontWeight="$medium">
                      {capitalizeFirst(selectedLog.user.role.replace('_', ' '))}
                    </Text>
                  </HStack>
                </VStack>

                {/* Timestamp */}
                <VStack space="md">
                  <HStack space="sm" alignItems="center">
                    <Clock size={18} color="#666" />
                    <Text fontWeight="$bold" size="md">
                      Timestamp
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text color="$secondary500">Date & Time:</Text>
                    <Text fontWeight="$medium" textAlign="right">
                      {formatDateTime(selectedLog.created_at)}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text color="$secondary500">Time Ago:</Text>
                    <Text fontWeight="$medium">
                      {formatTimeAgo(selectedLog.created_at)}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              onPress={handleCloseModal}
              flex={1}
            >
              <ButtonText>Close</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}