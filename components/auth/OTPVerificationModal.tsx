import {
  Button,
  Heading,
  HStack,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  useToast,
  VStack,
} from "@gluestack-ui/themed";
import React, { useEffect, useRef, useState, useContext  } from "react";
import { AppToast } from "../ui/AppToast";

import { verifyOTP, verifyUser, createOTP } from "../../hooks/otp_hook";

import { useRouter } from "expo-router";

import { AuthContext } from "../../context/AuthContext";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Dimensions
} from "react-native";

interface OTPVerificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onVerifySuccess: () => void;
  email: string;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isVisible,
  onClose,
  onVerifySuccess,
  email,
}) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [initialRequestSent, setInitialRequestSent] = useState<boolean>(false);
  const inputRefs = useRef<any[]>([]);
  const toast = useToast();
  const router = useRouter();
  const { user, login, refresh } = useContext(AuthContext)!;
  
  useEffect(() => {
    if(isVisible === true) {
      sendInitialOTP();
    }
  }, [isVisible]);

  const getDeviceInfo = () => {
    const { width } = Dimensions.get('window');
    
    const isTablet = width >= 768;
    const isDesktop = width >= 1024;
    
    let deviceType = 'mobile';
    if (isDesktop) deviceType = 'desktop';
    else if (isTablet) deviceType = 'tablet';

    let platformName: string = Platform.OS;
    if (Platform.OS === 'ios') {
      platformName = 'iOS';
    } else if (Platform.OS === 'android') {
      platformName = 'Android';
    } else if (Platform.OS === 'windows') {
      platformName = 'Windows';
    } else if (Platform.OS === 'macos') {
      platformName = 'macOS';
    } else if (Platform.OS === 'web') {
      platformName = 'Web';
    }

    return {
      os: `${platformName} ${Platform.Version}`,
      device: deviceType,
      platform: platformName,
      // deviceName: `${platformName} Device`,
    };
  };

  const sendInitialOTP = async () => {
    try {
      setResendLoading(true);
      const { success } = await createOTP({
        email,
        otp_type: "verification",
      });
      
      if(success === true) {
        setInitialRequestSent(true);
        startCountdown();
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="success"
              title="OTP Sent"
              description="Verification code has been sent to your email"
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
            title="Failed to Send OTP"
            description={
              error?.response?.data?.message ||
              "Failed to send verification code"
            }
          />
        ),
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      const { success } = await createOTP({
        email,
        otp_type: "verification",
      });

      if(success === true) {
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="success"
              title="OTP Resent"
              description="A new verification code has been sent to your email"
            />
          ),
        });
        startCountdown();
      }
    } catch (error: any) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Resend Failed"
            description={
              error?.response?.data?.message || "Failed to resend OTP"
            }
          />
        ),
      });
    } finally {
      setResendLoading(false);
    }
  };

  const startCountdown = () => {
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
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="attention"
            title="Invalid OTP"
            description="Please enter the 6-digit code"
          />
        ),
      });
      return;
    }

    setLoading(true);

    try {
      // const response = await verifyOTP(email, otpCode);
      const deviceInfo = getDeviceInfo();

      const input_data = {
        email,
        otp: otpCode,
        otp_type: "verification",
      }

      const input_data2 = {
        verify: true,
        email: email,
        device: deviceInfo.device, 
        platform: deviceInfo.platform, 
        os: deviceInfo.os 
      }
      const { data, success } = await verifyOTP(input_data);
 
      if (success === true) {

        const response = await verifyUser(input_data2);

        if (response.success === true) {
          await login(response.data.data.user, response.data.data.fetched_at);
          await refresh();
    
          router.replace("/resident/resident-index");
        
          onVerifySuccess();
          onClose();
          return;
        }

        router.replace("/auth/login");
      }
    } catch (error: any) {
      console.log("OTP Verification Error Details:", error);
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Verification Failed11"
            description={
              error?.response?.data?.message ||
              error.message ||
              "Invalid OTP code"
            }
          />
        ),
      });
      // Clear OTP on failure
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isVisible} onClose={onClose} closeOnOverlayClick={false}>
      <ModalBackdrop />
      <ModalContent
        width="90%"
        maxWidth="$96"
        minHeight="$80"
        paddingVertical="$4"
        marginHorizontal="$4"
      >
        <ModalHeader paddingBottom="$2">
          <Heading size="lg" textAlign="center">
            Verify Your Account 
          </Heading>
        </ModalHeader>
        <ModalBody>
          <VStack space="xl" alignItems="center" width="100%">
            <Text textAlign="center" px="$2">
              Enter the 6-digit verification code sent to{"\n"}
              <Text fontWeight="$bold" color="$primary600">
                {email}
              </Text>
            </Text>

            <HStack
              space="md"
              justifyContent="center"
              alignItems="center"
              width="100%"
              px="$2"
            >
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  size="lg"
                  width="$16"
                  height="$16"
                  flex={1}
                  maxWidth="$16"
                >
                  <InputField
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    fontSize="$2xl"
                    fontWeight="$bold"
                    paddingHorizontal="$1"
                  />
                </Input>
              ))}
            </HStack>

            <Button
              variant="link"
              onPress={handleResendOTP}
              isDisabled={countdown > 0 || resendLoading}
              height="$8"
            >
              <Text
                color={countdown > 0 ? "$gray400" : "$primary500"}
                fontSize="$sm"
                fontWeight={countdown > 0 ? "$normal" : "$medium"}
              >
                {resendLoading
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend code in ${countdown}s`
                  : "Resend verification code"}
              </Text>
            </Button>
          </VStack>
        </ModalBody>
        <ModalFooter paddingTop="$2">
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            mr="$3"
            flex={1}
          >
            <Text>Cancel</Text>
          </Button>
          <Button onPress={handleVerify} isDisabled={loading} flex={1}>
            <Text color="$white">{loading ? "Verifying..." : "Verify"}</Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
