import { Box, Button, Input, InputField, ScrollView, Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger, Text, Textarea, TextareaInput, VStack } from '@gluestack-ui/themed';
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useOffline } from '../../../context/OfflineContext';
import { reportService } from '../../../services/reportService';
import { Report } from '../../../types';
import { useRouter } from "expo-router";

import { createGarbageReportGuest } from "../../../hooks/report_hook";
import { useLocation } from '@/context/LocationContext';

interface ReportFormData {
  notes: string | undefined;
  garbage_type: string;
  report_type: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export default function GuestCreateReportScreen() {
  const router = useRouter();
  const { getCurrentLocation }: { getCurrentLocation: () => Promise<LocationData | null> } = useLocation();

  const [formData, setFormData] = useState<ReportFormData>({
    notes: '',
    garbage_type: '',
    report_type: ''
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    if (!formData.garbage_type) {
      alert('Please provide a garbage_type');
      return;
    }

    setLoading(true);
    try {
        const locationData = await getCurrentLocation();

        const input_data = {
          latitude: locationData?.latitude || 0,
          longitude: locationData?.longitude || 0,
          notes: formData?.notes || undefined,
          garbage_type: formData.garbage_type,
          report_type: formData.report_type,
        }

        const response = await createGarbageReportGuest(input_data);

        if (response.success) {
          alert('Report submitted successfully!');
          router.push("/guest/guest-report/guest-index");
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
                  <SelectItem label="Uncollected" value="uncollected" />
                  <SelectItem label="Overflowing" value="overflowing" />
                  <SelectItem label="Illegal Dumping" value="illegal_dumping" />
                  <SelectItem label="Missed Route" value="missed_route" />
                  <SelectItem label="Other" value="other" />
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>

          <VStack space="sm">
            <Text fontWeight="$bold">Garbage Type</Text>
            <Select onValueChange={(value: string) => setFormData({ ...formData, garbage_type: value })}>
              <SelectTrigger>
                <SelectInput placeholder="Select Garbage Type" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectItem label="Biodegradable" value="biodegradable" />
                  <SelectItem label="Non Biodegradable" value="non_biodegradable" />
                  <SelectItem label="Recyclable" value="recyclable" />
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
              Submit Report
            </Text>
          </Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
}