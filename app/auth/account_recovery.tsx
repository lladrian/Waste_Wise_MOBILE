import {
  Box,
  Button,
  ButtonText,
  Heading,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Text,
  useToast,
  VStack,
  HStack,
  Pressable,
  Center,
  ScrollView,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Spinner,
} from "@gluestack-ui/themed";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  Mail,
  Shield,
  CheckCircle,
  Lock,
  ArrowLeft,
  Recycle,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { AppToast } from "@/components/ui/AppToast";
import { Loader } from "@/components/ui/Loader";
import { verifyOTP, createOTP, changePasswordRecovery } from "../../hooks/recovery_hook";

interface RecoveryFormData {
  email: string;
  verification_code: string;
  new_password: string;
  confirm_password: string;
}

export default function AccountRecovery() {
  const [step, setStep] = useState(1); // 1: Email, 2: Verification, 3: New Password
  const [formData, setFormData] = useState<RecoveryFormData>({
    email: "",
    verification_code: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toast = useToast();
  const router = useRouter();

  const handleChange = (field: keyof RecoveryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="attention"
            title="Email Required"
            description="Please enter your email address"
          />
        ),
      });
      return;
    }

    setLoading(true);
    try {
      // Start countdown for resend (60 seconds)
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const input_data = {
        otp_type: "recovery",
        email: formData.email
      };

      const { data, success } = await createOTP(input_data);

      if (success === false) {
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="error"
              title="Failed to Send Code"
              description={data?.message || "Please try again"}
            />
          ),
        });
      } else {
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="success"
              title="Code Sent!"
              description={data?.data || "Verification code sent to your email"}
            />
          ),
        });
        setStep(2);
      }
    } catch (error: any) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Failed to Send Code"
            description={error?.response?.data?.message || "Please try again later"}
          />
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (formData.verification_code.length !== 6) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="attention"
            title="Invalid Code"
            description="Please enter a valid 6-digit code"
          />
        ),
      });
      return;
    }

    setLoading(true);
    try {
      const input_data = {
        otp_type: "recovery",
        email: formData.email,
        otp: formData.verification_code
      };

      const { data, success } = await verifyOTP(input_data);

      if (success === false) {
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="error"
              title="Verification Failed"
              description={data?.message || "Invalid verification code"}
            />
          ),
        });
      } else {
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="success"
              title="Code Verified!"
              description={data?.data || "Code verified successfully"}
            />
          ),
        });
        setStep(3);
      }
    } catch (error: any) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Verification Failed"
            description={error?.response?.data?.message || "Invalid verification code"}
          />
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (formData.new_password !== formData.confirm_password) {
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
      return;
    }

    if (formData.new_password.length < 6) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="attention"
            title="Weak Password"
            description="Password must be at least 6 characters long"
          />
        ),
      });
      return;
    }

    setLoading(true);
    try {
      const input_data = {
        password: formData.new_password,
        email: formData.email,
      };

      const { data, success } = await changePasswordRecovery(input_data);

      if (success === false) {
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="error"
              title="Reset Failed"
              description={data?.message || "Failed to reset password"}
            />
          ),
        });
      } else {
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="success"
              title="Password Reset!"
              description={data?.data || "Password reset successfully"}
            />
          ),
        });
        router.replace("/auth/login");
      }
    } catch (error: any) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Reset Failed"
            description={error?.response?.data?.message || "Failed to reset password"}
          />
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const input_data = {
        otp_type: "recovery",
        email: formData.email,
      };
      
      const { data, success } = await createOTP(input_data);

      if (success === false) {
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="error"
              title="Resend Failed"
              description={data?.message || "Failed to resend code"}
            />
          ),
        });
      } else {
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="success"
              title="Code Resent!"
              description={data?.data || "Verification code sent again"}
            />
          ),
        });
      }
    } catch (error: any) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Resend Failed"
            description={error?.response?.data?.message || "Failed to resend code"}
          />
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Reset Your Password";
      case 2:
        return "Enter Verification Code";
      case 3:
        return "Create New Password";
      default:
        return "Reset Your Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Enter your email address and we'll send you a verification code";
      case 2:
        return `Enter the 6-digit code sent to ${formData.email}`;
      case 3:
        return "Create a new password for your WasteWise account";
      default:
        return "";
    }
  };

  const ProgressSteps = () => (
    <HStack space="md" justifyContent="center" mb="$8">
      {[1, 2, 3].map((stepNumber) => (
        <HStack key={stepNumber} alignItems="center">
          <Center
            w="$10"
            h="$10"
            rounded="$full"
            bg={step >= stepNumber ? "$primary600" : "$gray200"}
            borderWidth={2}
            borderColor={step >= stepNumber ? "$primary600" : "$gray200"}
          >
            {step > stepNumber ? (
              <CheckCircle color="white" size={20} />
            ) : (
              <Text
                color={step >= stepNumber ? "$white" : "$gray600"}
                fontSize="$sm"
                fontWeight="$bold"
              >
                {stepNumber}
              </Text>
            )}
          </Center>
          {stepNumber < 3 && (
            <Box
              w="$12"
              h="$1"
              bg={step > stepNumber ? "$primary600" : "$gray200"}
            />
          )}
        </HStack>
      ))}
    </HStack>
  );

  if (loading && step === 1) return <Loader />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={"padding"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Box flex={1} bg="$blue50">
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Center flex={1} py="$8" px="$6">
              <Box w="$full" maxWidth={400}>
                {/* Main Card */}
                <Box
                  bg="$white"
                  rounded="$3xl"
                  overflow="hidden"
                  borderWidth={1}
                  borderColor="$blue100"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 10,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                    elevation: 10,
                  }}
                >
              
                  <Box p="$8">
                    <ProgressSteps />

                    <VStack space="lg">
                      <VStack space="sm" alignItems="center">
                        <Heading size="lg" textAlign="center">
                          {getStepTitle()}
                        </Heading>
                        <Text color="$secondary500" textAlign="center">
                          {getStepDescription()}
                        </Text>
                      </VStack>

                      {/* Step 1: Email Input */}
                      {step === 1 && (
                        <FormControl>
                          <FormControlLabel>
                            <FormControlLabelText>Email Address</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputSlot pl="$3">
                              <InputIcon as={Mail} size="sm" color="$secondary500" />
                            </InputSlot>
                            <InputField
                              placeholder="your.email@example.com"
                              value={formData.email}
                              onChangeText={(value: string) => handleChange("email", value)}
                              keyboardType="email-address"
                              autoCapitalize="none"
                            />
                          </Input>
                        </FormControl>
                      )}

                      {/* Step 2: Verification Code */}
                      {step === 2 && (
                        <VStack space="md">
                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText>Verification Code</FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputSlot pl="$3">
                                <InputIcon as={Lock} size="sm" color="$secondary500" />
                              </InputSlot>
                              <InputField
                                placeholder="000000"
                                value={formData.verification_code}
                                onChangeText={(value: string) => handleChange("verification_code", value.replace(/\D/g, '').slice(0, 6))}
                                keyboardType="number-pad"
                                textAlign="center"
                                fontSize="$lg"
                                fontWeight="$bold"
                                letterSpacing="$xl"
                                maxLength={6}
                              />
                            </Input>
                          </FormControl>

                          <Center>
                            <Pressable
                              onPress={resendVerificationCode}
                              disabled={countdown > 0 || loading}
                              opacity={countdown > 0 || loading ? 0.5 : 1}
                            >
                              <HStack space="sm" alignItems="center">
                                {countdown > 0 && <Clock size={16} color="#6B7280" />}
                                <Text
                                  color={countdown > 0 ? "$secondary500" : "$primary600"}
                                  fontSize="$sm"
                                  fontWeight="$medium"
                                >
                                  {countdown > 0
                                    ? `Resend code in ${countdown}s`
                                    : "Resend verification code"}
                                </Text>
                              </HStack>
                            </Pressable>
                          </Center>
                        </VStack>
                      )}

                      {/* Step 3: New Password */}
                      {step === 3 && (
                        <VStack space="md">
                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText>New Password</FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputSlot pl="$3">
                                <InputIcon as={Lock} size="sm" color="$secondary500" />
                              </InputSlot>
                              <InputField
                                placeholder="••••••••"
                                value={formData.new_password}
                                onChangeText={(value: string) => handleChange("new_password", value)}
                                secureTextEntry={!showNewPassword}
                              />
                              <InputSlot pr="$3" onPress={() => setShowNewPassword(!showNewPassword)}>
                                <InputIcon as={showNewPassword ? EyeOff : Eye} size="sm" color="$secondary500" />
                              </InputSlot>
                            </Input>
                          </FormControl>

                          <FormControl>
                            <FormControlLabel>
                              <FormControlLabelText>Confirm New Password</FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                              <InputSlot pl="$3">
                                <InputIcon as={Shield} size="sm" color="$secondary500" />
                              </InputSlot>
                              <InputField
                                placeholder="••••••••"
                                value={formData.confirm_password}
                                onChangeText={(value: string) => handleChange("confirm_password", value)}
                                secureTextEntry={!showConfirmPassword}
                              />
                              <InputSlot pr="$3" onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <InputIcon as={showConfirmPassword ? EyeOff : Eye} size="sm" color="$secondary500" />
                              </InputSlot>
                            </Input>
                          </FormControl>
                        </VStack>
                      )}

                      {/* Submit Button */}
                      <Button
                        onPress={
                          step === 1
                            ? handleSendVerificationCode
                            : step === 2
                            ? handleVerifyCode
                            : handleResetPassword
                        }
                        disabled={loading}
                        size="lg"
                        mt="$4"
                      >
                        {loading && <Spinner color="$white" size="small" mr="$2" />}
                        <ButtonText>
                          {loading
                            ? step === 1
                              ? "Sending Code..."
                              : step === 2
                              ? "Verifying..."
                              : "Resetting Password..."
                            : step === 1
                            ? "Send Verification Code"
                            : step === 2
                            ? "Verify Code"
                            : "Reset Password"}
                        </ButtonText>
                      </Button>

                      <Center>
                        <Text fontSize="$sm" color="$secondary500">
                          Remember your password?{" "}
                          <Link href="/auth/login" asChild>
                            <Text color="$primary500" fontWeight="$medium" fontSize="$sm" >
                              Sign In
                            </Text>
                          </Link>
                        </Text>
                      </Center>
                    </VStack>
                  </Box>
                </Box>
              </Box>
            </Center>
          </ScrollView>
        </Box>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}