import { GluestackUIProvider, Button, ButtonText } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { Tabs, router } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Text } from "react-native";
import { MapPin, Truck, Flag, Calendar } from "lucide-react-native"; // <-- icons import

export default function ResidentLayout() {
  // const { user } = useContext(AuthContext)!;

  return (
    <GluestackUIProvider config={config}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#007BFF",
          tabBarInactiveTintColor: "#999999",
          headerStyle: { backgroundColor: "#007BFF" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: () => (
            <Button
              size="sm"
              bg="#ffffff"
              mr="$3"
              onPress={() => router.push("/auth/login")}
            >
              <ButtonText color="#007BFF">Login</ButtonText>
            </Button>
          ),
        }}
      >
        <Tabs.Screen
          name="guest-track_collectors"
          options={{
            title: "Track Collectors",
            tabBarLabel: "Track",
            tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="guest-truck_logs"
          options={{
            title: "Truck Logs",
            tabBarLabel: "Logs",
            tabBarIcon: ({ color, size }) => <Truck color={color} size={size} />,
          }}
        />
       {/* <Tabs.Screen
        name="guest-schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, size }) => <Calendar  color={color} size={size} />,
        }}
      /> */}
        <Tabs.Screen
          name="guest-report"
          options={{
            title: "Report",
            tabBarIcon: ({ color, size }) => <Flag color={color} size={size} />,
          }}
        />
      </Tabs>
    </GluestackUIProvider>
  );
}
