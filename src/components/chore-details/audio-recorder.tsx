import { useAudioRecorder, useAudioRecorderState } from "expo-audio";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import {
  CUSTOM_RECORDING_OPTIONS,
  requestAudioPermissions,
  startRecording,
  stopRecording,
  uploadAudioToFirebase,
} from "../../api/audio";
import { CustomPaperButton } from "../custom-paper-button";

interface AudioRecorderProps {
  householdId: string;
  choreId: string;
  onAudioUploaded: (audioUrl: string) => void;
  onCancel: () => void;
}

export function AudioRecorderComponent({
  householdId,
  choreId,
  onAudioUploaded,
  onCancel,
}: AudioRecorderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Be om tillstånd när komponenten mountas
  useEffect(() => {
    const getPermission = async () => {
      try {
        const granted = await requestAudioPermissions();
        setPermissionGranted(granted);
        if (!granted) {
          setError(
            "Mikrofontillstånd nekades. Aktivera det i inställningarna.",
          );
        }
      } catch (err) {
        console.error("Permission error:", err);
        setError("Kunde inte be om mikrofontillstånd");
      }
    };
    getPermission();
  }, []);

  // Skapa recorder med useAudioRecorder hook
  // Använder custom options för bättre filstorlek och kompatibilitet
  const recorder = useAudioRecorder(CUSTOM_RECORDING_OPTIONS);

  // Få recording state (uppdateras varje 100ms)
  const recordingState = useAudioRecorderState(recorder, 100);

  // Förbered recordern när tillstånd är givet
  useEffect(() => {
    const prepareRecorder = async () => {
      if (permissionGranted && !recordingState.canRecord) {
        try {
          await recorder.prepareToRecordAsync();
        } catch (err) {
          console.error("Failed to prepare recorder:", err);
          setError("Kunde inte förbereda inspelning");
        }
      }
    };
    prepareRecorder();
  }, [permissionGranted, recorder, recordingState.canRecord]);

  const handleStartRecording = async () => {
    try {
      setError(null);

      if (!permissionGranted) {
        setError("Mikrofontillstånd krävs för att spela in");
        return;
      }

      await startRecording(recorder);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start recording",
      );
      console.error("Recording error:", err);
    }
  };

  const handleStopAndUpload = async () => {
    try {
      setIsUploading(true);
      setError(null);

      // Stoppa inspelning och få URI
      const uri = await stopRecording(recorder);

      // Ladda upp till Firebase
      const audioUrl = await uploadAudioToFirebase(uri, householdId, choreId);

      // Notifiera parent component
      onAudioUploaded(audioUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload audio");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Spela in ljud
      </Text>

      {/* Recording Status */}
      <View style={styles.statusContainer}>
        <Text variant="headlineMedium" style={styles.time}>
          {formatTime(recordingState.durationMillis)}
        </Text>
        <Text variant="bodyMedium">
          {recordingState.isRecording
            ? "🔴 Spelar in..."
            : "⏹️ Klar att spela in"}
        </Text>
        {!recordingState.canRecord && (
          <Text variant="bodySmall" style={styles.warning}>
            ⚠️ Kan inte spela in ännu...
          </Text>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text variant="bodyMedium" style={styles.error}>
          {error}
        </Text>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {!recordingState.isRecording && (
          <CustomPaperButton
            mode="contained"
            text="Starta inspelning"
            onPress={handleStartRecording}
            icon="microphone"
            disabled={isUploading || !recordingState.canRecord}
          />
        )}

        {recordingState.isRecording && (
          <CustomPaperButton
            mode="contained"
            onPress={handleStopAndUpload}
            icon="stop"
            text="Stoppa & Spara"
          />
        )}
        <CustomPaperButton
          mode="outlined"
          text="Avbryt"
          onPress={onCancel}
          disabled={isUploading}
          style={styles.cancelButton}
        />
      </View>

      {/* Loading Indicator */}
      {isUploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Laddar upp ljud till Firebase...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  statusContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  time: {
    fontFamily: "monospace",
    marginBottom: 10,
  },
  controls: {
    gap: 10,
  },
  cancelButton: {
    marginTop: 10,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  warning: {
    color: "orange",
    textAlign: "center",
    marginTop: 5,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
  },
});
