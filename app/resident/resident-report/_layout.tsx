import { Stack } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

export default function ResidentReportLayout() {
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
            title: "History",
          }}
        />
        <Stack.Screen
          name="resident-create_report"
          options={{
            title: "Report",
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}