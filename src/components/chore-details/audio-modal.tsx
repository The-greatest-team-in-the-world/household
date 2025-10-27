import { selectedChoreAtom } from "@/atoms/chore-atom";
import { useAtom } from "jotai";
import { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { Portal, Surface, Text, useTheme } from "react-native-paper";
import { CustomPaperButton } from "../custom-paper-button";
import { AudioPlayerComponent } from "./audio-player";
import { AudioRecorderComponent } from "./audio-recorder";

export default function AudioModal({
  visible,
  onDismiss,
  householdId,
  choreId,
  onAudioSaved,
  onAudioDeleted,
  isCreating,
}: {
  visible: boolean;
  onDismiss: () => void;
  householdId: string;
  choreId: string;
  onAudioSaved: (audioUrl: string) => void;
  onAudioDeleted?: () => void;
  isCreating?: boolean;
}) {
  const theme = useTheme();
  const [selectedChore] = useAtom(selectedChoreAtom);
  const [isRecording, setIsRecording] = useState(false);

  const currentAudioUrl = isCreating ? null : selectedChore?.audioUrl;

  console.log("AudioModal currentAudioUrl:", currentAudioUrl);

  const handleAudioUploaded = (audioUrl: string) => {
    setIsRecording(false);
    onAudioSaved(audioUrl);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
  };

  const handleDeleteAudio = () => {
    if (onAudioDeleted) {
      onAudioDeleted();
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} style={styles.modal}>
        <Surface
          style={[styles.surface, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="headlineSmall" style={styles.header}>
            Ljudinspelning
          </Text>

          {/* Visa befintligt ljud om det finns */}
          {currentAudioUrl && !isRecording && (
            <View style={styles.section}>
              <AudioPlayerComponent
                audioUrl={currentAudioUrl}
                showDeleteButton={true}
                onDelete={handleDeleteAudio}
              />
            </View>
          )}

          {/* Visa inspelningskomponent */}
          {isRecording && (
            <View style={styles.section}>
              <AudioRecorderComponent
                householdId={householdId}
                choreId={choreId}
                onAudioUploaded={handleAudioUploaded}
                onCancel={handleCancelRecording}
              />
            </View>
          )}

          {/* Visa knapp för att börja spela in om det inte finns ljud och inte spelar in */}
          {!currentAudioUrl && !isRecording && (
            <View style={styles.section}>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Ingen ljudinspelning finns ännu.
              </Text>
              <CustomPaperButton
                mode="contained"
                text="Spela in nytt ljud"
                icon="microphone"
                onPress={handleStartRecording}
                style={styles.recordButton}
              />
            </View>
          )}

          {/* Visa knapp för att spela in nytt ljud om det redan finns ett */}
          {currentAudioUrl && !isRecording && (
            <View style={styles.section}>
              <CustomPaperButton
                mode="outlined"
                text="Spela in nytt ljud"
                icon="microphone"
                onPress={handleStartRecording}
                style={styles.recordButton}
              />
            </View>
          )}

          {/* Stäng-knapp */}
          {!isRecording && (
            <CustomPaperButton
              mode="outlined"
              text="Stäng"
              onPress={onDismiss}
              style={styles.closeButton}
            />
          )}
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    padding: 20,
  },
  surface: {
    justifyContent: "center",
    flex: 1,
    padding: 24,
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginVertical: 10,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.7,
  },
  recordButton: {
    marginTop: 10,
  },
  closeButton: {
    marginTop: 20,
  },
});
