import {
  Box,
  Button,
  Image,
  Input,
  InputField,
  ScrollView,
  Text,
  useToast,
  VStack,
} from "@gluestack-ui/themed";
import { Link, useRouter } from "expo-router";
import React, { useState, useContext, useEffect } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Dimensions
} from "react-native";

import { OTPVerificationModal } from "../../components/auth/OTPVerificationModal";
import { AppToast } from "../../components/ui/AppToast";
import { Loader } from "../../components/ui/Loader";

import { loginUser } from "../../hooks/login_hook";
import { verifyOTP } from "../../hooks/otp_hook";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // OTP Verification states
  const [showOTPModal, setShowOTPModal] = useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");

  const { login } = useContext(AuthContext)!;
  const toast = useToast();
  const router = useRouter();

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


  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      toast.show({
        placement: "top right",

        render: ({ id }) => (
          <AppToast
            id={id}
            type="attention"
            title="Login Failed"
            description="Please fill in all fields"
          />
        ),
      });
      return;
    }

    setLoading(true);
    try {
      const deviceInfo = getDeviceInfo();

      const { data, success } = await loginUser({
        email,
        password,
        device: deviceInfo.device,
        platform: deviceInfo.platform,
        os: deviceInfo.os
      });

      if (success === true) {
        if (data.data.user.is_verified === false) {
          setPendingEmail(data.data.user.email);
          setShowOTPModal(true);
          return;
        }

        if (data.data.user.role === "resident") {
          router.replace("/resident/resident-index");
          await login(data.data.user, data.data.logged_in_at);
          return;
        }

        if (data.data.user.role === "garbage_collector") {
          router.replace("/collector/collector-index");
          await login(data.data.user, data.data.logged_in_at);
          return;
        }
      }
    } catch (error: any) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Login Failed"
            description={
              error?.response?.data?.message ||
              error.message ||
              "Something went wrong"
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
          title="Verification Successful"
          // description="Your account has been verified! Please login again."
          description="Your account has been verified."
        />
      ),
    });
    // Clear the form
    setEmail("");
    setPassword("");
  };

  if (loading) return <Loader />;

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "white" }}
        behavior={"padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
            }}
            keyboardShouldPersistTaps="handled"
          >
            <VStack space="lg" px="$6" py="$6">
              {/* Logo & Title */}
              <Box alignItems="center" mb="$2">
                <Image
                  source={require("../../assets/logo.png")}
                  alt="WasteWise Logo"
                  width={150}
                  height={150}
                  resizeMode="contain"
                />
                {/* <Text size="2xl" fontWeight="$bold" color="$primary500">
                  WasteWise
                </Text> */}
                <Text color="$secondary500">Sign in to your account</Text>
              </Box>

              {/* Input Fields */}
              <VStack space="md">
                <Input>
                  <InputField
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Input>

                <Input>
                  <InputField
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </Input>

                <Button onPress={handleLogin} mt="$4">
                  <Text color="$white">Sign In</Text>
                </Button>
              </VStack>

              {/* Links at Bottom */}
              <VStack space="sm" mt="$8" alignItems="center">
                <Link href="/auth/account_recovery" asChild>
                  <Text color="$primary500">Forgot Password?</Text>
                </Link>
{/* 
                <Text color="$secondary500">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/signup">
                    <Text color="$primary500">Sign up</Text>
                  </Link>
                </Text> */}

                {/* Continue as Guest Button */}
                <Button
                  mt="$4"
                  bg="#F3F4F6"        // light gray
                  px="$6"
                  py="$2.5"
                  rounded="$full"
                  width="100%"
                  onPress={() => router.replace("/guest/guest-track_collectors")}
                  style={{
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 3,
                  }}
                >
                  <Text color="#1F2937" fontWeight="$bold" fontSize="$md">
                    Continue as Guest
                  </Text>
                </Button>
              </VStack>
            </VStack>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* OTP Verification Modal for unverified accounts */}
      <OTPVerificationModal
        isVisible={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerifySuccess={handleVerificationSuccess}
        email={pendingEmail}
      />
    </>
  );
}
