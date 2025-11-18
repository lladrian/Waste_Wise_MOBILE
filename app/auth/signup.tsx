import {
  Box,
  Button,
  ButtonText,
  Heading,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollView,
  Text,
  useToast,
  VStack,
  HStack,
  Image,
  Pressable,
  Center,
  Divider,
  Icon,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@gluestack-ui/themed";
import { AuthContext } from "../../context/AuthContext";

import { OTPVerificationModal } from "@/components/auth/OTPVerificationModal";
import { AppToast } from "@/components/ui/AppToast";
import { Loader } from "@/components/ui/Loader";
import { Barangay as BarangayType } from "@/types/index";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState, useContext } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import {
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock,
  User,
  MapPin,
  Search,
  ChevronRight,
  ChevronDown,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Recycle,
} from "lucide-react-native";

import { createUser, getAllBarangay } from "../../hooks/register_hook";
import { useFocusEffect } from "@react-navigation/native";

interface SignupFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  contact_number: string;
  password: string;
  confirmPassword: string;
  email: string;
  barangay: string;
  barangay_name?: string;
  role: string;
}

export default function Signup() {
  const [formData, setFormData] = useState<SignupFormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    contact_number: "",
    password: "",
    confirmPassword: "",
    email: "",
    barangay: "",
    role: "resident",
  });
  const { login } = useContext(AuthContext)!;
  const [barangays, setBarangays] = useState<BarangayType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBarangayModalVisible, setBarangayModalVisible] = useState(false);
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // OTP Verification states
  const [showOTPModal, setShowOTPModal] = useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");

  const toast = useToast();
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      fetchBarangays();
    }, [])
  );


  const fetchBarangays = async () => {
    try {
      const { data, success } = await getAllBarangay();
      if (success === true) {
        setBarangays(data.data);
      }
    } catch (error) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Error"
            description="Failed to load barangays."
          />
        ),
      });
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (
          !formData.first_name ||
          !formData.middle_name ||
          !formData.last_name ||
          !formData.gender ||
          !formData.contact_number
        ) {
          toast.show({
            placement: "top right",
            render: ({ id }) => (
              <AppToast
                id={id}
                type="attention"
                title="Missing Information"
                description="Please fill in all required fields"
              />
            ),
          });

          return false;
        }

        if (formData.contact_number.length !== 10) {
          toast.show({
            placement: "top right",
            render: ({ id }) => (
              <AppToast
                id={id}
                type="attention"
                title="Invalid Contact Number"
                description="Contact number must be exactly 10 digits"
              />
            ),
          });

          return false;
        }

        return true;
      case 2:
        if (
          !formData.email ||
          !formData.password ||
          !formData.confirmPassword
        ) {
          toast.show({
            placement: "top right",
            render: ({ id }) => (
              <AppToast
                id={id}
                type="attention"
                title="Missing Information"
                description="Please fill in all account details"
              />
            ),
          });
          return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.show({
            placement: "top right",
            render: ({ id }) => (
              <AppToast
                id={id}
                type="attention"
                title="Invalid Email"
                description="Please enter a valid email address"
              />
            ),
          });
          return false;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.show({
            placement: "top right",
            render: ({ id }) => (
              <AppToast
                id={id}
                type="attention"
                title="Password Mismatch"
                description="Passwords do not match"
              />
            ),
          });
          return false;
        }
        return true;
      case 3:
        if (!formData.barangay) {
          toast.show({
            placement: "top right",
            render: ({ id }) => (
              <AppToast
                id={id}
                type="attention"
                title="Location Required"
                description="Please select your barangay"
              />
            ),
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSignup = async (): Promise<void> => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const { data, success } = await createUser({
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        gender: formData.gender.toLowerCase(),
        contact_number: formData.contact_number,
        password: formData.password,
        email: formData.email,
        role: "resident",
        barangay: formData.barangay,
      });

      if (success === true) {
        await login(data.data.user, data.data.logged_in_at);
        setPendingEmail(formData.email);
        setShowOTPModal(true);
        setCurrentStep(1);
        setFormData({
          first_name: "",
          middle_name: "",
          last_name: "",
          gender: "",
          contact_number: "",
          password: "",
          confirmPassword: "",
          email: "",
          barangay: "",
          role: "resident",
        });
      }
    } catch (error: any) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Signup Failed"
            description={
              error?.response?.data?.message || "Something went wrong."
            }
          />
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    toast.show({
      placement: "top right",
      render: ({ id }) => (
        <AppToast
          id={id}
          type="success"
          title="Welcome!"
          description="Your account has been verified successfully!"
        />
      ),
    });
  };

  const filteredBarangays = barangays.filter((b) =>
    b.barangay_name.toLowerCase().includes(search.toLowerCase())
  );

  const genders = ["Male", "Female"];

  const StepIndicator = () => (
    <HStack space="md" justifyContent="center" mb="$8">
      {[1, 2, 3].map((step) => (
        <HStack key={step} alignItems="center">
          <Center
            w="$6"
            h="$6"
            rounded="$full"
            bg={
              step === currentStep
                ? "$primary600"
                : step < currentStep
                ? "$success600"
                : "$gray300"
            }
            borderWidth={2}
            borderColor={
              step === currentStep
                ? "$primary600"
                : step < currentStep
                ? "$success600"
                : "$gray300"
            }
          >
            {step < currentStep ? (
              <Icon as={CheckCircle} color="$white" size="sm" />
            ) : (
              <Text
                color={step === currentStep ? "$white" : "$gray600"}
                fontSize="$xs"
                fontWeight="$bold"
              >
                {step}
              </Text>
            )}
          </Center>
          {step < 3 && (
            <Box
              w="$8"
              h="$1"
              bg={step < currentStep ? "$success600" : "$gray300"}
            />
          )}
        </HStack>
      ))}
    </HStack>
  );

  const StepTitles = {
    1: "Personal Information",
    2: "Account Details",
    3: "Location Details",
  };

  if (loading) return <Loader />;

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Box flex={1} bg="$blue50">
            {/* Header */}
            {/* <Box
              bg="$white"
              py="$4"
              px="$6"
              borderBottomWidth={1}
              borderBottomColor="$blue100"
            >
              <HStack justifyContent="space-between" alignItems="center">
                <HStack alignItems="center" space="md">
                  <Center w="$12" h="$12" bg="$primary500" rounded="$xl">
                    <Icon as={Recycle} color="$white" size="xl" />
                  </Center>
                  <VStack>
                    <Text fontSize="$xl" fontWeight="$bold" color="$primary600">
                      WasteWise
                    </Text>
                    <Text fontSize="$sm" color="$secondary500">
                      Smart Waste Management
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => router.push("/auth/login")}
                >
                  <ButtonText>Sign In</ButtonText>
                </Button>
              </HStack>
            </Box> */}

            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Box flex={1} justifyContent="center" alignItems="center" py="$8">
                <Box w="$full" maxWidth={480} px="$6">
                  {/* Progress Section */}
                  <Box mb="$8">
                    <StepIndicator />
                    <VStack alignItems="center" space="sm">
                      <Text fontSize="$sm" color="$secondary500">
                        Step {currentStep} of 3
                      </Text>
                      <Heading size="lg" color="$primary600">
                        {StepTitles[currentStep as keyof typeof StepTitles]}
                      </Heading>
                      <Text textAlign="center" color="$secondary500">
                        {currentStep === 1 && "Tell us about yourself"}
                        {currentStep === 2 && "Create your account credentials"}
                        {currentStep === 3 && "Select your location"}
                      </Text>
                    </VStack>
                  </Box>

                  {/* Form Content */}
                  <Box
                    bg="$white"
                    rounded="$2xl"
                    p="$6"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.1,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}
                  >
                    <VStack space="lg">
                      {/* Step 1: Personal Information */}
                      {currentStep === 1 && (
                        <VStack space="md">
                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText>
                                First Name *
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputSlot pl="$3">
                                <InputIcon
                                  as={User}
                                  size="sm"
                                  color="$secondary500"
                                />
                              </InputSlot>
                              <InputField
                                placeholder="First Name"
                                value={formData.first_name}
                                onChangeText={(text: string) =>
                                  setFormData({
                                    ...formData,
                                    first_name: text,
                                  })
                                }
                              />
                            </Input>
                          </FormControl>

                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText>
                                Middle Name *
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputField
                                placeholder="Middle Name"
                                value={formData.middle_name}
                                onChangeText={(text: string) =>
                                  setFormData({
                                    ...formData,
                                    middle_name: text,
                                  })
                                }
                              />
                            </Input>
                          </FormControl>

                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText>
                                Last Name *
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputField
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChangeText={(text: string) =>
                                  setFormData({ ...formData, last_name: text })
                                }
                              />
                            </Input>
                          </FormControl>

                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText>
                                Gender *
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Pressable
                              onPress={() => setGenderModalVisible(true)}
                            >
                              <Input pointerEvents="none">
                                <InputField
                                  placeholder="Select Gender"
                                  value={formData.gender}
                                  editable={false}
                                />
                                <InputSlot pr="$3">
                                  <InputIcon
                                    as={ChevronDown}
                                    size="sm"
                                    color="$secondary500"
                                  />
                                </InputSlot>
                              </Input>
                            </Pressable>
                          </FormControl>

                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText>
                                Contact Number
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputSlot pl="$3">
                                <InputIcon
                                  as={Phone}
                                  size="sm"
                                  color="$secondary500"
                                />
                              </InputSlot>
                              <InputField
                                placeholder="9123456789"
                                value={formData.contact_number}
                                onChangeText={(text: string) =>
                                  setFormData({
                                    ...formData,
                                    contact_number: text
                                      .replace(/\D/g, "")
                                      .slice(0, 10),
                                  })
                                }
                                keyboardType="phone-pad"
                              />
                            </Input>
                          </FormControl>
                        </VStack>
                      )}

                      {/* Step 2: Account Details */}
                      {currentStep === 2 && (
                        <VStack space="md">
                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText>
                                Email Address *
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputSlot pl="$3">
                                <InputIcon
                                  as={Mail}
                                  size="sm"
                                  color="$secondary500"
                                />
                              </InputSlot>
                              <InputField
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChangeText={(text: string) =>
                                  setFormData({ ...formData, email: text })
                                }
                                keyboardType="email-address"
                                autoCapitalize="none"
                              />
                            </Input>
                          </FormControl>

                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText>
                                Password *
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputSlot pl="$3">
                                <InputIcon
                                  as={Lock}
                                  size="sm"
                                  color="$secondary500"
                                />
                              </InputSlot>
                              <InputField
                                placeholder="••••••••"
                                value={formData.password}
                                onChangeText={(text: string) =>
                                  setFormData({ ...formData, password: text })
                                }
                                secureTextEntry={!showPassword}
                              />
                              <InputSlot
                                pr="$3"
                                onPress={() => setShowPassword(!showPassword)}
                              >
                                <InputIcon
                                  as={showPassword ? EyeOff : Eye}
                                  size="sm"
                                  color="$secondary500"
                                />
                              </InputSlot>
                            </Input>
                          </FormControl>

                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText>
                                Confirm Password *
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputSlot pl="$3">
                                <InputIcon
                                  as={Shield}
                                  size="sm"
                                  color="$secondary500"
                                />
                              </InputSlot>
                              <InputField
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChangeText={(text: string) =>
                                  setFormData({
                                    ...formData,
                                    confirmPassword: text,
                                  })
                                }
                                secureTextEntry={!showConfirmPassword}
                              />
                              <InputSlot
                                pr="$3"
                                onPress={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                <InputIcon
                                  as={showConfirmPassword ? EyeOff : Eye}
                                  size="sm"
                                  color="$secondary500"
                                />
                              </InputSlot>
                            </Input>
                          </FormControl>
                        </VStack>
                      )}

                      {/* Step 3: Location Details */}
                      {currentStep === 3 && (
                        <VStack space="md">
                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText>
                                Barangay *
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Pressable
                              onPress={() => setBarangayModalVisible(true)}
                            >
                              <Input pointerEvents="none">
                                <InputSlot pl="$3">
                                  <InputIcon
                                    as={MapPin}
                                    size="sm"
                                    color="$secondary500"
                                  />
                                </InputSlot>
                                <InputField
                                  placeholder="Select Your Barangay"
                                  value={formData.barangay_name}
                                  editable={false}
                                />
                                <InputSlot pr="$3">
                                  <InputIcon
                                    as={ChevronDown}
                                    size="sm"
                                    color="$secondary500"
                                  />
                                </InputSlot>
                              </Input>
                            </Pressable>
                          </FormControl>

                          <Box bg="$blue50" p="$4" rounded="$lg">
                            <HStack space="sm" alignItems="flex-start">
                              <Icon
                                as={CheckCircle}
                                color="$primary600"
                                size="sm"
                                mt="$0.5"
                              />
                              <VStack flex={1}>
                                <Text
                                  fontSize="$sm"
                                  fontWeight="$medium"
                                  color="$primary600"
                                >
                                  Almost There!
                                </Text>
                                <Text fontSize="$xs" color="$secondary600">
                                  Your account will be created after email
                                  verification. You`ll be able to access all
                                  WasteWise features.
                                </Text>
                              </VStack>
                            </HStack>
                          </Box>
                        </VStack>
                      )}

                      {/* Navigation Buttons */}
                      <HStack justifyContent="space-between" mt="$6">
                        <Button
                          variant="outline"
                          onPress={prevStep}
                          disabled={currentStep === 1}
                          opacity={currentStep === 1 ? 0.5 : 1}
                        >
                          <HStack space="sm" alignItems="center">
                            <Icon as={ArrowLeft} size="sm" />
                            <ButtonText>Previous</ButtonText>
                          </HStack>
                        </Button>

                        {currentStep <= 2 ? (
                          <Button onPress={nextStep}>
                            <HStack space="sm" alignItems="center">
                              <ButtonText>Next</ButtonText>
                              <Icon as={ArrowRight} size="sm" />
                            </HStack>
                          </Button>
                        ) : (
                          <Button onPress={handleSignup} disabled={loading}>
                            <HStack space="sm" alignItems="center">
                              <Icon as={CheckCircle} size="sm" />
                              <ButtonText>
                                {loading
                                  ? "Creating Account..."
                                  : "Create Account"}
                              </ButtonText>
                            </HStack>
                          </Button>
                        )}
                      </HStack>

                      <Divider my="$4" />

                      <Center>
                        <Text fontSize="$sm" color="$secondary500">
                          Already have an account?{" "}
                          <Link href="/auth/login" asChild>
                            <Text color="$primary500" fontWeight="$medium">
                              Sign in
                            </Text>
                          </Link>
                        </Text>
                      </Center>
                    </VStack>
                  </Box>
                </Box>
              </Box>
            </ScrollView>
          </Box>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Gender Modal */}
      <Modal
        isOpen={isGenderModalVisible}
        onClose={() => setGenderModalVisible(false)}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Select Gender</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack space="sm">
              {genders.map((gender, index) => (
                <Pressable
                  key={`${gender}-${index}`}
                  onPress={() => {
                    setFormData({ ...formData, gender });
                    setGenderModalVisible(false);
                  }}
                  py="$3"
                  borderBottomWidth={1}
                  borderColor="$gray200"
                >
                  <Text fontSize="$md">{gender}</Text>
                </Pressable>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              onPress={() => setGenderModalVisible(false)}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Barangay Modal */}
      <Modal
        isOpen={isBarangayModalVisible}
        onClose={() => setBarangayModalVisible(false)}
        size="full"
      >
        <ModalBackdrop />
        <ModalContent
          maxHeight="$3/4"
          marginHorizontal="$5"
          width="$full"
          style={{
            margin: 20,
            width: "90%",
          }}
        >
          <ModalHeader
            borderBottomWidth={1}
            borderBottomColor="$gray200"
            pb="$4"
          >
            <VStack space="md" width="$full">
              <Heading size="lg" color="$primary600">
                Select Barangay
              </Heading>
              <Input variant="outline" size="lg" borderRadius="$lg">
                <InputSlot pl="$3">
                  <InputIcon as={Search} size="sm" color="$secondary500" />
                </InputSlot>
                <InputField
                  placeholder="Search barangay..."
                  value={search}
                  onChangeText={setSearch}
                  fontSize="$md"
                />
              </Input>
            </VStack>
          </ModalHeader>

          <ModalBody py="$4">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <VStack space="sm">
                {filteredBarangays.length > 0 ? (
                  filteredBarangays.map((item, index) => (
                    <Pressable
                      key={`${item._id}-${index}`}
                      onPress={() => {
                        setFormData({
                          ...formData,
                          barangay: item._id,
                          barangay_name: item.barangay_name,
                        });
                        setBarangayModalVisible(false);
                        setSearch("");
                      }}
                      px="$3"
                      py="$3"
                      borderBottomWidth={1}
                      borderColor="$gray100"
                      // _hover={{ bg: "$blue50" }}
                      // _pressed={{ bg: "$blue100" }}
                      borderRadius="$md"
                    >
                      <HStack space="md" alignItems="center">
                        <Center
                          w="$8"
                          h="$8"
                          bg="$primary50"
                          borderRadius="$full"
                        >
                          <Icon as={MapPin} size="sm" color="$primary600" />
                        </Center>
                        <VStack flex={1}>
                          <Text
                            fontSize="$md"
                            fontWeight="$medium"
                            color="$gray800"
                          >
                            {item.barangay_name}
                          </Text>
                          <Text fontSize="$sm" color="$gray500">
                            Barangay
                          </Text>
                        </VStack>
                        <Icon as={ChevronRight} size="sm" color="$gray400" />
                      </HStack>
                    </Pressable>
                  ))
                ) : (
                  <Center py="$8">
                    <VStack space="sm" alignItems="center">
                      <Center
                        w="$12"
                        h="$12"
                        bg="$gray100"
                        borderRadius="$full"
                      >
                        <Icon as={Search} size="lg" color="$gray400" />
                      </Center>
                      <Text fontSize="$md" color="$gray500" textAlign="center">
                        No barangays found
                      </Text>
                      <Text fontSize="$sm" color="$gray400" textAlign="center">
                        Try adjusting your search terms
                      </Text>
                    </VStack>
                  </Center>
                )}
              </VStack>
            </ScrollView>
          </ModalBody>

          <ModalFooter borderTopWidth={1} borderTopColor="$gray200" pt="$4">
            <Button
              variant="outline"
              action="secondary"
              onPress={() => setBarangayModalVisible(false)}
              size="lg"
              flex={1}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isVisible={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerifySuccess={handleVerificationSuccess}
        email={pendingEmail}
      />
    </>
  );
}
