import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import {
  requestCameraPermissions,
  requestMediaLibraryPermissions,
} from "../../api/image";
import { CustomPaperButton } from "../custom-paper-button";

type Props = {
  onImageSelected: (imageUrl: string) => void;
};

export default function ImageButtons({ onImageSelected }: Props) {
  const theme = useTheme();
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [mediaLibraryPermissionGranted, setMediaLibraryPermissionGranted] =
    useState(false);
  const [error, setError] = useState<string | null>(null);

  // Be om tillstånd när komponenten mountas
  useEffect(() => {
    const getPermissions = async () => {
      try {
        const [cameraGranted, mediaLibraryGranted] = await Promise.all([
          requestCameraPermissions(),
          requestMediaLibraryPermissions(),
        ]);

        setCameraPermissionGranted(cameraGranted);
        setMediaLibraryPermissionGranted(mediaLibraryGranted);

        if (!cameraGranted && !mediaLibraryGranted) {
          setError(
            "Kamera- och bildgalleritillstånd nekades. Aktivera dem i inställningarna.",
          );
        } else if (!cameraGranted) {
          setError("Kameratillstånd nekades. Aktivera det i inställningarna.");
        } else if (!mediaLibraryGranted) {
          setError(
            "Bildgalleritillstånd nekades. Aktivera det i inställningarna.",
          );
        }
      } catch (err) {
        console.error("Permission error:", err);
        setError("Kunde inte be om tillstånd");
      }
    };
    getPermissions();
  }, []);

  async function pickImage() {
    if (!mediaLibraryPermissionGranted) {
      setError("Bildgalleritillstånd krävs för att välja bilder");
      return;
    }

    try {
      setError(null);
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte välja bild");
      console.error("Image picker error:", err);
    }
  }

  async function takePhoto() {
    if (!cameraPermissionGranted) {
      setError("Kameratillstånd krävs för att ta bilder");
      return;
    }

    try {
      setError(null);
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte ta bild");
      console.error("Camera error:", err);
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Error Message */}
      {error && (
        <Text variant="bodyMedium" style={styles.error}>
          {error}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <CustomPaperButton
          mode="contained"
          text="Lägg till bild"
          icon="image"
          onPress={() => pickImage()}
          style={{ flex: 1 }}
          disabled={!mediaLibraryPermissionGranted}
        />
        <CustomPaperButton
          mode="contained"
          text="Ta ny bild"
          icon="camera"
          onPress={() => takePhoto()}
          style={{ flex: 1 }}
          disabled={!cameraPermissionGranted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});
