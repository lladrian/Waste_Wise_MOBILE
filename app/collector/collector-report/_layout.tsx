import { Stack } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

export default function CollectorReportLayout() {
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
            title: "History",
          }}
        />
        <Stack.Screen
          name="collector-create_report"
          options={{
            title: "Report",
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}