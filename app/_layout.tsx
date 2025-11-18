import { Stack } from "expo-router";
import "react-native-reanimated";
import React, { useContext } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from '@/context/LocationContext'; // Adjust path as needed

import { OfflineProvider } from "@/context/OfflineContext";
import { customConfig } from "@/gluestack-ui.config";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { ToastProvider } from "@gluestack-ui/toast";
import { AuthContext } from "@/context/AuthContext";

export default function RootLayout() {
  // const { user, loading } = useContext(AuthContext)!;

  return (
    <GluestackUIProvider config={customConfig}>
      <ToastProvider>
        <AuthProvider>
          <LocationProvider>
            <OfflineProvider>
              {/* Keep it simple - just declare all possible routes */}
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="collector" />
                <Stack.Screen name="resident" />
              </Stack>
            </OfflineProvider>
          </LocationProvider>
        </AuthProvider>
      </ToastProvider>
    </GluestackUIProvider>
  );
}
