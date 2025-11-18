import { Box, Image } from "@gluestack-ui/themed";
import React, { useContext } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { AuthContext } from "@/context/AuthContext";

export default function Index() {
  const { user, loading } = useContext(AuthContext)!;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Box alignItems="center" mb="$8">
          <Image
            source={require("../assets/logo.png")}
            alt="WasteWise Logo"
            width={120}
            height={120}
            resizeMode="contain"
          />
        </Box>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  if (user.role === "resident") {
    console.log('resident')
    return <Redirect href="/resident/resident-index" />;
  }

  // Role-based redirects
  if (user.role === "garbage_collector") {
    console.log('garbage collector')
    return <Redirect href="/collector/collector-index" />;
  }

  // Fallback redirect
  return <Redirect href="/auth/login" />;
}
