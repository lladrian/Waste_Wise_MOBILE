import {
  Badge,
  BadgeText,
  Box,
  Button,
  Card,
  HStack,
  ScrollView,
  Text,
  useToast,
  VStack,
} from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import { AlertTriangle } from "lucide-react-native"; // Import the icon
import { staticReports } from "../../../data/staticData";

import React, { useContext, useEffect, useState } from "react";
import { getAllCollectorReport } from "../../../hooks/report_hook";


import { AppToast } from "@/components/ui/AppToast";
import { AuthContext } from "@/context/AuthContext";
import { useLocation } from '@/context/LocationContext';
import { useFocusEffect } from "@react-navigation/native";

export interface CollectorReport {
  _id: string;
  position: string;
  notes: string;
  report_type: string;
  created_at: string;
  resolution_status: string;
  [key: string]: any;
}

export default function CollectorReportScreen() {
  const { user } = useContext(AuthContext)!;
  const reports = staticReports;
  const router = useRouter();
  const toast = useToast();
  const [collectorReports, setCollectorReports] = useState<CollectorReport[]>([]);
    const { connectWebSocket, fetchTodayScheduleRecords } = useLocation();


  useFocusEffect(
    React.useCallback(() => {
      fetchCollectorReports();
      connectWebSocket();
      fetchTodayScheduleRecords();
    }, [])
  );

  const fetchCollectorReports = async () => {
    try {
      const { data, success } = await getAllCollectorReport(user?._id || "");
      if (success === true) {
        setCollectorReports(data.data);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "success";
      case "in-progress":
        return "info";
      case "pending":
        return "warning";
      default:
        return "error";
    }
  };

  const handleReportPress = () => {
    router.push("/collector/collector-report/collector-create_report");
  };


  const formatText = (text: string) => {
    if (!text) return '';
    
    return text
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };


  return (
    <>
      <ScrollView flex={1} bg="$white">
        <VStack space="lg" p="$4">
          <Box>
            <Text size="xl" fontWeight="$bold">
              Report History ({collectorReports.length})
            </Text>
            <Text color="$secondary500">
              Track your submitted reports and their status
            </Text>
          </Box>

          <VStack space="md">
            {collectorReports.map((report) => (
              <Card key={report._id}>
                <VStack space="sm">
                  <HStack
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <VStack space="xs" flex={1}>
                      <Text fontWeight="$bold" textTransform="capitalize">
                        {formatText(report?.report_type)}
                      </Text>
                      <Text color="$secondary500" size="sm">
                        Report Type: {formatText(report?.report_type)}
                      </Text>
                      <Text color="$secondary500" size="sm">
                        Specific Issue: {formatText(report?.specific_issue)}
                      </Text>
                      {report?.notes && (
                        <Text size="sm">Notes: {report?.notes}</Text>
                      )}
                    </VStack>
                    <Badge action={getStatusColor(report.resolution_status)}>
                      <BadgeText textTransform="capitalize">
                        {report?.resolution_status}
                      </BadgeText>
                    </Badge>
                  </HStack>

                  <HStack justifyContent="space-between">
                    <Text size="sm" color="$secondary500">
                      Date: {report?.created_at}
                    </Text>
                    {/* <Text size="sm" color="$secondary500">
                  Urgency: {report?.urgency}
                </Text> */}
                  </HStack>

                  {/* {report.response && (
                <Box bg="$success50" p="$2" borderRadius="$sm">
                  <Text size="sm" color="$success700">
                    💬 Response: {report.response}
                  </Text>
                </Box>
              )} */}
                </VStack>
              </Card>
            ))}
          </VStack>

          {reports.length === 0 && (
            <Card>
              <Text textAlign="center" color="$secondary500">
                No reports submitted yet
              </Text>
            </Card>
          )}
        </VStack>
      </ScrollView>
      <Box position="absolute" bottom="$4" right="$4" zIndex={999}>
        <Button
          onPress={handleReportPress}
          bg="$white"
          size="lg"
          rounded="$full"
          w={70}
          h={70}
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <AlertTriangle size={28} color="#0066CC" />
        </Button>
      </Box>
    </>
  );
}
