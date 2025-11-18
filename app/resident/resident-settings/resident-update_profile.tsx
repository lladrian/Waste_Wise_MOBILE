import {
  Avatar,
  AvatarFallbackText,
  Box,
  Button,
  ButtonText,
  Center,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Input,
  InputField,
  ScrollView,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useOffline } from "../../../context/OfflineContext";



import { updateUserProfile } from "../../../hooks/update_profile_hook";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";

interface ProfileFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  gender: string;
  contact_number: string;
}

export default function ResidentProfileScreen() {
  const { user, updateProfile, refresh } = useContext(AuthContext)!;
  const { isOnline } = useOffline();
  const router = useRouter();

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: user?.first_name || "",
    middle_name: user?.middle_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    gender: user?.gender || "",
    contact_number: user?.contact_number || "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.contact_number) {
      newErrors.contact_number = "Contact number is required";
    }

     if (!formData.contact_number) {
      newErrors.contact_number = "Contact number is required";
    }

    if (!/^\d{10}$/.test(formData.contact_number)) {
      newErrors.contact_number = "Contact number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      alert("Please fix the errors in the form");
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      if (isOnline) {
        const input_data = {
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          email: formData.email,
          gender: formData.gender,
          contact_number: formData.contact_number,
        };
        
        const response = await updateUserProfile(user?._id, input_data);

        if (response.success === true) {
          await updateProfile(response.data.data);
          await refresh();
          router.push("/resident/resident-settings/resident-index");
        }
      } else {
        alert(
          "You are offline. Profile changes will be saved when you are back online."
        );
      }
    } catch (error: any) {
      alert("Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={"padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView 
          flex={1} 
          bg="$blue50"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <VStack space="xl" p="$6" flex={1}>
            {/* Form Section */}
            <Box bg="$white" p="$6" borderRadius="$2xl" shadowColor="$blue200">
              <VStack space="xl">
                {/* Personal Information Section */}
                <Box>
                  <Text size="lg" fontWeight="$bold" color="$blue800" mb="$4">
                    Personal Information
                  </Text>
                  <VStack space="md">
                    {/* First Name */}
                    <FormControl isInvalid={!!errors.first_name}>
                      <FormControlLabel>
                        <FormControlLabelText
                          fontWeight="$semibold"
                          color="$blue800"
                        >
                          First Name 
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        bg="$blue50"
                        borderColor={errors.first_name ? "$red500" : "$blue200"}
                        borderWidth="$1"
                        borderRadius="$lg"
                      >
                        <InputField
                          placeholder="Enter your first name"
                          value={formData.first_name}
                          onChangeText={(text: string) =>
                            handleInputChange("first_name", text)
                          }
                          color="$blue800"
                          fontWeight="$medium"
                        />
                      </Input>
                      {errors.first_name && (
                        <Text color="$red500" fontSize="$sm" mt="$1">
                          {errors.first_name}
                        </Text>
                      )}
                    </FormControl>

                    {/* Middle Name */}
                    <FormControl>
                      <FormControlLabel>
                        <FormControlLabelText
                          fontWeight="$semibold"
                          color="$blue800"
                        >
                          Middle Name
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        bg="$blue50"
                        borderColor="$blue200"
                        borderWidth="$1"
                        borderRadius="$lg"
                      >
                        <InputField
                          placeholder="Enter your middle name"
                          value={formData.middle_name}
                          onChangeText={(text: string) =>
                            handleInputChange("middle_name", text)
                          }
                          color="$blue800"
                          fontWeight="$medium"
                        />
                      </Input>
                    </FormControl>

                    {/* Last Name */}
                    <FormControl isInvalid={!!errors.last_name}>
                      <FormControlLabel>
                        <FormControlLabelText
                          fontWeight="$semibold"
                          color="$blue800"
                        >
                          Last Name 
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        bg="$blue50"
                        borderColor={errors.last_name ? "$red500" : "$blue200"}
                        borderWidth="$1"
                        borderRadius="$lg"
                      >
                        <InputField
                          placeholder="Enter your last name"
                          value={formData.last_name}
                          onChangeText={(text: string) =>
                            handleInputChange("last_name", text)
                          }
                          color="$blue800"
                          fontWeight="$medium"
                        />
                      </Input>
                      {errors.last_name && (
                        <Text color="$red500" fontSize="$sm" mt="$1">
                          {errors.last_name}
                        </Text>
                      )}
                    </FormControl>
                  </VStack>
                </Box>

                {/* Contact Information Section */}
                <Box>
                  <Text size="lg" fontWeight="$bold" color="$blue800" mb="$4">
                    Contact Information
                  </Text>
                  <VStack space="md">
                    {/* Email */}
                    <FormControl isInvalid={!!errors.email}>
                      <FormControlLabel>
                        <FormControlLabelText
                          fontWeight="$semibold"
                          color="$blue800"
                        >
                          Email Address 
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        bg="$blue50"
                        borderColor={errors.email ? "$red500" : "$blue200"}
                        borderWidth="$1"
                        borderRadius="$lg"
                      >
                        <InputField
                          placeholder="Enter your email address"
                          value={formData.email}
                          onChangeText={(text: string) =>
                            handleInputChange("email", text)
                          }
                          keyboardType="email-address"
                          autoCapitalize="none"
                          color="$blue800"
                          fontWeight="$medium"
                        />
                      </Input>
                      {errors.email && (
                        <Text color="$red500" fontSize="$sm" mt="$1">
                          {errors.email}
                        </Text>
                      )}
                    </FormControl>

                    {/* Phone Number */}
                    <FormControl>
                      <FormControlLabel>
                        <FormControlLabelText
                          fontWeight="$semibold"
                          color="$blue800"
                        >
                          Phone Number
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        bg="$blue50"
                        borderColor="$blue200"
                        borderWidth="$1"
                        borderRadius="$lg"
                      >
                        <InputField
                          placeholder="Enter your phone number"
                          value={formData.contact_number}
                          onChangeText={(text: string) =>
                            handleInputChange("contact_number", text)
                          }
                          keyboardType="phone-pad"
                          color="$blue800"
                          fontWeight="$medium"
                        />
                      </Input>
                    </FormControl>
                  </VStack>
          
                  <VStack space="md">
                    {/* Gender */}
                    <FormControl isInvalid={!!errors.gender}>
                      <FormControlLabel>
                        <FormControlLabelText
                          fontWeight="$semibold"
                          color="$blue800"
                        >
                          Gender123
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Select
                        selectedValue={formData.gender}
                        onValueChange={(value: string) =>
                          handleInputChange("gender", value)
                        }
                      >
                        <SelectTrigger
                          bg="$blue50"
                          borderColor={errors.gender ? "$red500" : "$blue200"}
                          borderWidth="$1"
                        >
                          <SelectInput
                            placeholder="Select your gender"
                            color="$blue800"
                            fontWeight="$medium"
                          />
                        </SelectTrigger>
                        <SelectPortal>
                          <SelectBackdrop />
                          <SelectContent
                            bg="$white"
                            borderColor="$blue200"
                            borderWidth="$1"
                          >
                            <SelectDragIndicatorWrapper>
                              <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            <SelectItem label="Male" value="male" />
                            <SelectItem label="Female" value="female" />
                          </SelectContent>
                        </SelectPortal>
                      </Select>
                      {errors.gender && (
                        <Text color="$red500" fontSize="$sm" mt="$1">
                          {errors.gender}
                        </Text>
                      )}
                    </FormControl>
                  </VStack>
                </Box>

                {/* Action Buttons */}
                <HStack space="md" mt="$4">
                  <Button
                    flex={1}
                    onPress={handleSubmit}
                    disabled={loading}
                    bg="$blue500"
                    borderColor="$blue600"
                    borderWidth="$1"
                    borderRadius="$lg"
                    shadowColor="$blue700"
                    opacity={loading ? 0.7 : 1}
                  >
                    <ButtonText color="$white" fontWeight="$bold" fontSize="$md">
                      {loading ? "Updating..." : "Update Profile"}
                    </ButtonText>
                  </Button>
                </HStack>

                {/* Offline Indicator */}
                {!isOnline && (
                  <Center bg="$blue100" p="$3" borderRadius="$lg">
                    <Text
                      color="$blue700"
                      textAlign="center"
                      size="sm"
                      fontWeight="$medium"
                    >
                      📶 You are currently offline. Profile will update when
                      connection is restored.
                    </Text>
                  </Center>
                )}
              </VStack>
            </Box>
          </VStack>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}