import { Tabs } from "expo-router";
import {
  Clock,
  Flag,
  Home,
  MapPin,
  Settings as SettingsIcon,
} from "lucide-react-native";

export default function CollectorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#007BFF",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          height: 120, // 👈 increase or decrease this value as needed
          paddingBottom: 5, // optional: adjust icon/text spacing
          paddingTop: 5, // optional: adjust vertical spacing
          borderTopWidth: 0.5,
          borderTopColor: "#ddd",
        },
        tabBarActiveTintColor: "#007BFF",
        tabBarInactiveTintColor: "#999999",
      }}
    >
      <Tabs.Screen
        name="collector-index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="collector-routes"
        options={{
          title: "Routes",
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="collector-attendance"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="collector-schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, size }) => <Flag color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="collector-report"
        options={{
          title: "Report",
          tabBarIcon: ({ color, size }) => <Flag color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="collector-settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon color={color} size={size} />
          ),
        }}
      />

      {/* <Tabs.Screen
        name="report"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: null, // This hides it from the tab bar
        }}
      /> */}
    </Tabs>
  );
}
