import { Box, Button, Input, InputField, ScrollView, Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger, Text, Textarea, TextareaInput, VStack } from '@gluestack-ui/themed';
import React, { useState,   useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useOffline } from '../../../context/OfflineContext';
import { reportService } from '../../../services/reportService';
import { Report } from '../../../types';
import { useRouter } from "expo-router";

import { createGarbageReport } from "../../../hooks/report_hook";

interface ReportFormData {
  notes: string | undefined;
  garbage_type: 'biodegradable' | 'non_biodegradable' | 'recyclable' | 'other';
  report_type: 'uncollected' | 'overflowing' | 'illegal_dumping' | 'missed_route' | 'other';
}

export default function ResidentCreateReportScreen() {
  const { user } = useContext(AuthContext)!;
  const { addPendingAction, isOnline } = useOffline();
  const router = useRouter();
  const [formData, setFormData] = useState<ReportFormData>({
    notes: '',
    garbage_type: 'biodegradable',
    report_type: 'uncollected'
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    if (!formData.garbage_type) {
      alert('Please provide a garbage_type');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      if (isOnline) {
        const input_data = {
          user: user?._id,
          latitude: user?.garbage_site?.position?.lat,
          longitude: user?.garbage_site?.position?.lng,
          notes: formData?.notes || undefined,
          garbage_type: formData.garbage_type,
          report_type: formData.report_type,
        }
        console.log(input_data)

        const response = await createGarbageReport(input_data);

        if (response.success) {
          alert('Report submitted successfully!');
          router.push("/resident/resident-index");
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
            <Select onValueChange={(value: string) => setFormData({...formData, report_type: value as 'uncollected' | 'overflowing' | 'illegal_dumping' | 'missed_route' | 'other'})}>
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
            <Select onValueChange={(value: string) => setFormData({...formData, garbage_type: value as 'biodegradable' | 'non_biodegradable' | 'recyclable' | 'other'})}>
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
                onChangeText={(text: string) => setFormData({...formData, notes: text})}
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