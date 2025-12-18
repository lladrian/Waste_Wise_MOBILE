import { Stack } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

export default function GuestReportLayout() {
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
          name="guest-index"
          options={{
            title: "History",
          }}
        />
        <Stack.Screen
          name="guest-create_report"
          options={{
            title: "Report",
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}