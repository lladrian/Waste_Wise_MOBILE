import { Stack } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

export default function CollectorSettingsLayout() {
  return (
    <GluestackUIProvider config={config}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: "#007BFF",
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="collector-index"
          options={{
            title: "Settings",
          }}
        />
        collector-
        <Stack.Screen
          name="collector-login_history"
          options={{
            title: "Login History",
          }}
        />
        <Stack.Screen
          name="collector-update_profile"
          options={{
            title: "Update Profile",
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}