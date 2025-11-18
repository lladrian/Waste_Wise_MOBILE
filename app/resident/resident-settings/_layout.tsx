import { Stack } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

export default function ResidentSettingsLayout() {
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
          name="resident-index"
          options={{
            title: "Settings",
          }}
        />
        <Stack.Screen
          name="resident-login_history"
          options={{
            title: "Login History",
          }}
        />
        <Stack.Screen
          name="resident-update_profile"
          options={{
            title: "Update Profile",
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}