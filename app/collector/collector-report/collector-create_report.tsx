import { Box, Button, Input, InputField, ScrollView, Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger, Text, Textarea, TextareaInput, VStack } from '@gluestack-ui/themed';
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useOffline } from '../../../context/OfflineContext';
import { reportService } from '../../../services/reportService';
import { Report } from '../../../types';
import { useRouter } from "expo-router";

import { createCollectorReport } from "../../../hooks/report_hook";
import { useLocation } from '@/context/LocationContext';
import { useFocusEffect } from "@react-navigation/native";

interface ReportFormData {
  notes: string | undefined;
  specific_issue: string;
  report_type: string;
}

export default function CollectorCreateReportScreen() {
  const { user } = useContext(AuthContext)!;
  const { addPendingAction, isOnline } = useOffline();
  const router = useRouter();
  const [formData, setFormData] = useState<ReportFormData>({
    notes: '',
    specific_issue: 'vehicle_issue',
    report_type: 'uncollected'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const { connectWebSocket, fetchTodayScheduleRecords } = useLocation();


  useFocusEffect(
    React.useCallback(() => {
      connectWebSocket();
      fetchTodayScheduleRecords();
    }, [])
  );


  const handleSubmit = async (): Promise<void> => {
    if (!formData.specific_issue) {
      alert('Please provide a specific_issue');
      return;
    }
    if (!formData.report_type) {
      alert('Please provide a report_type');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      if (isOnline) {
        const input_data = {
          user: user?._id,
          truck: user?._id,
          latitude: user?.garbage_site?.position?.lat || '10.123',
          longitude: user?.garbage_site?.position?.lng || '124.123',
          notes: formData?.notes || undefined,
          specific_issue: formData.specific_issue,
          report_type: formData.report_type,
        }


        console.log(input_data)

        const response = await createCollectorReport(input_data);

        if (response.success) {
          alert('Report submitted successfully!');
          router.push("/collector/collector-report/collector-index");
        }
      } else {
        // Add to offline queue
        // await addPendingAction({
        //   type: 'SUBMIT_REPORT',
        //   data: reportData
        // });
        alert('Report saved offline. It will sync when you are back online.');
        // setFormData({
        //   type: 'uncollected',
        //   description: '',
        //   location: '',
        //   urgency: 'medium'
        // });
      }
    } catch (error: any) {
      alert('Failed to submit report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        <Box>
          <Text size="xl" fontWeight="$bold">Report an Issue</Text>
          <Text color="$secondary500">Report uncollected garbage or other issues</Text>
        </Box>

        <VStack space="md">
          <VStack space="sm">
            <Text fontWeight="$bold">Report Type</Text>
            <Select onValueChange={(value: string) => setFormData({ ...formData, report_type: value })}>
              <SelectTrigger>
                <SelectInput placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectItem label="Vehicle Issue" value="vehicle_issue" />
                  <SelectItem label="Equipment Problem" value="equipment_problem" />
                  <SelectItem label="Route Issue" value="route_issue" />
                  <SelectItem label="Safety Incident" value="safety_incident" />
                  <SelectItem label="Other" value="other" />
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>

          <VStack space="sm">
            <Text fontWeight="$bold">Specific Issue</Text>
            <Select onValueChange={(value: string) => setFormData({ ...formData, specific_issue: value })}>
              <SelectTrigger>
                <SelectInput placeholder="Select Specific Issue" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectItem label="Truck Breakdown" value="truck_breakdown" />
                  <SelectItem label="Engine Failure" value="engine_failure" />
                  <SelectItem label="Tire Flat" value="tire_flat" />
                  <SelectItem label="Fuel Empty" value="fuel_empty" />
                  <SelectItem label="Mechanical Failure" value="mechanical_failure" />
                  <SelectItem label="Equipment Malfunction" value="equipment_malfunction" />
                  <SelectItem label="Route Blocked" value="route_blocked" />
                  <SelectItem label="Road Condition" value="road_condition" />
                  <SelectItem label="Weather Hazard" value="weather_hazard" />
                  <SelectItem label="Safety Concern" value="safety_concern" />
                  <SelectItem label="Other" value="other" />
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>


          <VStack space="sm">
            <Text fontWeight="$bold">Notes</Text>
            <Textarea>
              <TextareaInput
                placeholder="Please describe the issue in detail..."
                value={formData.notes}
                onChangeText={(text: string) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={4}
              />
            </Textarea>
          </VStack>

          <Button onPress={handleSubmit} disabled={loading}>
            <Text color="$white">
              {isOnline ? 'Submit Report' : 'Save Offline'}
            </Text>
          </Button>

          {!isOnline && (
            <Text color="$warning500" textAlign="center" size="sm">
              You are currently offline. Report will be submitted when connection is restored.
            </Text>
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
}