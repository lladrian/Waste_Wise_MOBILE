import { Box, Image } from "@gluestack-ui/themed";
import { View } from "react-native";

export default function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Box alignItems="center" mb="$8">
        <Image
          source={require("../../assets/logo.png")}
          alt="WasteWise Logo"
          width={120}
          height={120}
          resizeMode="contain"
        />
      </Box>
    </View>
  );
}