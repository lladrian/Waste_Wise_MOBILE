import { LocationModal } from "@/components/LocationModal";
// import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { User } from "@/types";
import { config } from "@gluestack-ui/config";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { Tabs } from "expo-router";
import {
  Calendar,
  Flag,
  History,
  MapPin,
  Home,
  Settings as SettingsIcon,
} from "lucide-react-native";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext"; // Import the correct context

export default function ResidentLayout() {
  // const { user, updateUser } = useAuth();
  const { user } = useContext(AuthContext)!;

  return (
    <GluestackUIProvider config={config}>
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
          name="resident-index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />

        <Tabs.Screen
          name="resident-schedule"
          options={{
            title: "Schedule",
            tabBarIcon: ({ color, size }) => (
              <Calendar color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="resident-track_collectors"
          options={{
            title: "Track",
            tabBarIcon: ({ color, size }) => (
              <MapPin color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="resident-report"
          options={{
            title: "Report",
            tabBarIcon: ({ color, size }) => (
              <History color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="resident-settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <SettingsIcon color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </GluestackUIProvider>
  );
}
