import { useLocation } from "@/hooks/useLocation";
import {
    Box,
    Button,
    ButtonText,
    Heading,
    HStack,
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import * as Location from "expo-location";
import React, { useState } from "react";
import { Alert } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSet: (location: { lat: number; lng: number }) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  onClose,
  onLocationSet,
}) => {
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 14.5995, // Default to Philippines coordinates
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const { getCurrentLocation } = useLocation();

  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please enable location permissions in your device settings to set your pickup location.",
          [{ text: "OK" }]
        );
        return;
      }

      const location = await getCurrentLocation();

      if (location) {
        onLocationSet({
          lat: location.latitude,
          lng: location.longitude,
        });
        onClose();
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Location Error",
        "Failed to get your current location. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocation = () => {
    setManualMode(true);
    // Try to get current location to center the map
    getCurrentLocationForMap();
  };

  const getCurrentLocationForMap = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const location = await getCurrentLocation();
        if (location) {
          setMapRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
          setSelectedLocation({
            lat: location.latitude,
            lng: location.longitude,
          });
        }
      }
    } catch (error) {
      console.error("Error getting current location for map:", error);
    }
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation({
      lat: coordinate.latitude,
      lng: coordinate.longitude,
    });
  };

  const handleConfirmManualLocation = () => {
    if (selectedLocation) {
      onLocationSet(selectedLocation);
      onClose();
      setManualMode(false);
      setSelectedLocation(null);
    } else {
      Alert.alert(
        "No Location Selected",
        "Please tap on the map to select your pickup location.",
        [{ text: "OK" }]
      );
    }
  };

  const handleBackToOptions = () => {
    setManualMode(false);
    setSelectedLocation(null);
  };

  const handleClose = () => {
    setManualMode(false);
    setSelectedLocation(null);
    onClose();
  };

  return (
    <Modal isOpen={visible} onClose={handleClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">
            {manualMode ? "Select Pickup Location" : "Set Your Pickup Location"}
          </Heading>
        </ModalHeader>
        <ModalBody>
          {manualMode ? (
            <VStack space="md" style={{ height: 400 }}>
              <Text size="sm" textAlign="center">
                Tap on the map to mark your exact pickup location
              </Text>

              <Box flex={1} borderRadius="$md" overflow="hidden">
                <MapView
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  region={mapRegion}
                  onPress={handleMapPress}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                >
                  {selectedLocation && (
                    <Marker
                      coordinate={{
                        latitude: selectedLocation.lat,
                        longitude: selectedLocation.lng,
                      }}
                      title="Pickup Location"
                      description="Your garbage collection point"
                      pinColor="#007BFF"
                    />
                  )}
                </MapView>
              </Box>

              {selectedLocation && (
                <Box bg="$blue50" p="$3" borderRadius="$md">
                  <Text size="sm" textAlign="center">
                    Selected Location: {selectedLocation.lat.toFixed(6)},{" "}
                    {selectedLocation.lng.toFixed(6)}
                  </Text>
                </Box>
              )}
            </VStack>
          ) : (
            <VStack space="md">
              <Text size="md" textAlign="center">
                To ensure proper garbage collection, please set your location.
                This helps collectors find your pickup point efficiently.
              </Text>

              <VStack space="sm">
                <Button
                  onPress={handleGetCurrentLocation}
                  isDisabled={loading}
                  variant="solid"
                  action="primary"
                  size="md"
                >
                  {loading ? (
                    <HStack space="sm" alignItems="center">
                      <Spinner size="small" color="$white" />
                      <ButtonText>Getting Location...</ButtonText>
                    </HStack>
                  ) : (
                    <ButtonText>Use Current Location</ButtonText>
                  )}
                </Button>

                <Button
                  onPress={handleManualLocation}
                  variant="outline"
                  action="primary"
                  size="md"
                >
                  <ButtonText>Select on Map</ButtonText>
                </Button>
              </VStack>

              <Box>
                <Text size="xs" textAlign="center" color="$textLight500">
                  Your location is only used to mark your garbage pickup point
                  and help collectors navigate to your location.
                </Text>
              </Box>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          {manualMode ? (
            <HStack space="sm" flex={1}>
              <Button
                variant="outline"
                action="secondary"
                onPress={handleBackToOptions}
                flex={1}
              >
                <ButtonText>Back</ButtonText>
              </Button>
              <Button
                variant="solid"
                action="primary"
                onPress={handleConfirmManualLocation}
                flex={1}
                isDisabled={!selectedLocation}
              >
                <ButtonText>Confirm</ButtonText>
              </Button>
            </HStack>
          ) : (
            <Button variant="link" action="secondary" onPress={handleClose}>
              <ButtonText>Maybe Later</ButtonText>
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
