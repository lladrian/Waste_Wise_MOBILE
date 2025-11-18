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

interface GarbageSite {
  _id: string;
  garbage_site_name: string;
  barangay: string;
  position: {
    lat: number;
    lng: number;
  };
  created_at: string;
  __v: number;
}

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSet: (siteId: string) => void;
  garbageSites: GarbageSite[];
}

export const LocationModalOrmoc: React.FC<LocationModalProps> = ({
  visible,
  onClose,
  onLocationSet,
  garbageSites,
}) => {
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [selectedSite, setSelectedSite] = useState<GarbageSite | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 11.006, // Ormoc City coordinates
    longitude: 124.6075,
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
        // Find the nearest garbage site to current location
        const nearestSite = findNearestSite(
          location.latitude,
          location.longitude
        );
        if (nearestSite) {
          setSelectedSite(nearestSite);
          onLocationSet(nearestSite._id);
          onClose();
        } else {
          Alert.alert(
            "No Sites Found",
            "No garbage collection sites found near your location.",
            [{ text: "OK" }]
          );
        }
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

  const findNearestSite = (lat: number, lng: number): GarbageSite | null => {
    if (!garbageSites.length) return null;

    let nearestSite = garbageSites[0];
    let shortestDistance = calculateDistance(
      lat,
      lng,
      nearestSite.position.lat,
      nearestSite.position.lng
    );

    garbageSites.forEach((site) => {
      const distance = calculateDistance(
        lat,
        lng,
        site.position.lat,
        site.position.lng
      );
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestSite = site;
      }
    });

    return nearestSite;
  };

  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleManualLocation = () => {
    setManualMode(true);
    setSelectedSite(null); // Reset selection when entering manual mode

    // Center map on first garbage site or default location
    if (garbageSites.length > 0) {
      const firstSite = garbageSites[0];
      setMapRegion({
        latitude: firstSite.position.lat,
        longitude: firstSite.position.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  // NEW: Handle direct marker press
  const handleMarkerPress = (site: GarbageSite) => {
    setSelectedSite(site);
  };

  // NEW: Handle map press for area selection
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;

    // Find the nearest garbage site to the tapped location with a maximum distance
    const nearestSite = findNearestSiteWithinDistance(
      coordinate.latitude,
      coordinate.longitude,
      0.5
    ); // 0.5km max distance

    if (nearestSite) {
      setSelectedSite(nearestSite);
    } else {
      Alert.alert(
        "No Site Nearby",
        "No garbage collection site found nearby. Please tap closer to a site marker.",
        [{ text: "OK" }]
      );
    }
  };

  // NEW: Find nearest site within a maximum distance
  const findNearestSiteWithinDistance = (
    lat: number,
    lng: number,
    maxDistanceKm: number
  ): GarbageSite | null => {
    if (!garbageSites.length) return null;

    let nearestSite: GarbageSite | null = null;
    let shortestDistance = maxDistanceKm;

    garbageSites.forEach((site) => {
      const distance = calculateDistance(
        lat,
        lng,
        site.position.lat,
        site.position.lng
      );
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestSite = site;
      }
    });

    return nearestSite;
  };

  const handleConfirmManualLocation = () => {
    if (selectedSite) {
      onLocationSet(selectedSite._id);
      onClose();
      setManualMode(false);
      setSelectedSite(null);
    } else {
      Alert.alert(
        "No Site Selected",
        "Please select a garbage collection site by tapping on a marker or near a site.",
        [{ text: "OK" }]
      );
    }
  };

  const handleBackToOptions = () => {
    setManualMode(false);
    setSelectedSite(null);
  };

  const handleClose = () => {
    setManualMode(false);
    setSelectedSite(null);
    onClose();
  };

  return (
    <Modal isOpen={visible} onClose={handleClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">
            {manualMode
              ? "Select Garbage Collection Site"
              : "Set Your Collection Site"}
          </Heading>
        </ModalHeader>
        <ModalBody>
          {manualMode ? (
            <VStack space="md" style={{ height: 400 }}>
              <Text size="sm" textAlign="center">
                Tap directly on a site marker or tap near a site to select it
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
                  {/* Display all garbage sites */}
                  {garbageSites.map((site) => (
                    <Marker
                      key={site._id}
                      coordinate={{
                        latitude: site.position.lat,
                        longitude: site.position.lng,
                      }}
                      title={site.garbage_site_name}
                      description="Tap to select this site"
                      pinColor={
                        selectedSite?._id === site._id ? "#28a745" : "#007BFF"
                      }
                      onPress={() => handleMarkerPress(site)}
                    />
                  ))}
                </MapView>
              </Box>

              {selectedSite ? (
                <Box bg="$green50" p="$3" borderRadius="$md">
                  <Text size="sm" textAlign="center" fontWeight="bold">
                    Selected: {selectedSite.garbage_site_name}
                  </Text>
                  <Text size="xs" textAlign="center">
                    Location: {selectedSite.position.lat.toFixed(6)},{" "}
                    {selectedSite.position.lng.toFixed(6)}
                  </Text>
                </Box>
              ) : (
                <Box bg="$blue50" p="$3" borderRadius="$md">
                  <Text size="sm" textAlign="center">
                    No site selected. Tap on a marker or near a site to select.
                  </Text>
                </Box>
              )}
            </VStack>
          ) : (
            <VStack space="md">
              <Text size="md" textAlign="center">
                Select your preferred garbage collection site. Available sites
                in your barangay are shown on the map.
              </Text>

              <VStack space="sm">
                <Button
                  onPress={handleGetCurrentLocation}
                  isDisabled={loading || garbageSites.length === 0}
                  variant="solid"
                  action="primary"
                  size="md"
                >
                  {loading ? (
                    <HStack space="sm" alignItems="center">
                      <Spinner size="small" color="$white" />
                      <ButtonText>Finding Nearest Site...</ButtonText>
                    </HStack>
                  ) : (
                    <ButtonText>Use Nearest Site to My Location</ButtonText>
                  )}
                </Button>

                <Button
                  onPress={handleManualLocation}
                  variant="outline"
                  action="primary"
                  size="md"
                  isDisabled={garbageSites.length === 0}
                >
                  <ButtonText>Select from Map</ButtonText>
                </Button>
              </VStack>

              {garbageSites.length === 0 && (
                <Box bg="$red50" p="$3" borderRadius="$md">
                  <Text size="sm" textAlign="center" color="$red600">
                    No garbage collection sites available in your barangay.
                  </Text>
                </Box>
              )}

              <Box>
                <Text size="xs" textAlign="center" color="$textLight500">
                  Available sites in your barangay: {garbageSites.length}
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
                isDisabled={!selectedSite}
              >
                <ButtonText>Confirm Site</ButtonText>
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
