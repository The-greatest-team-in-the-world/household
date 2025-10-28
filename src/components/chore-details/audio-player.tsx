import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  IconButton,
  ProgressBar,
  Text,
  useTheme,
} from "react-native-paper";

interface AudioPlayerProps {
  audioUrl: string;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

export function AudioPlayerComponent({
  audioUrl,
  onDelete,
  showDeleteButton = false,
}: AudioPlayerProps) {
  const theme = useTheme();

  const player = useAudioPlayer(audioUrl);
  const status = useAudioPlayerStatus(player);
  const progress =
    status.duration > 0 ? status.currentTime / status.duration : 0;
  const isLoading = status.timeControlStatus === "waitingToPlayAtSpecifiedRate";

  const togglePlayPause = () => {
    if (!status.playing && status.currentTime >= status.duration - 0.1) {
      player.seekTo(0);
    }

    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleStop = () => {
    player.pause();
    player.seekTo(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View style={styles.header}>
        <Text variant="titleMedium">Ljudinspelning</Text>
        {showDeleteButton && onDelete && (
          <IconButton icon="delete" size={20} onPress={onDelete} />
        )}
      </View>

      <ProgressBar progress={progress} style={styles.progressBar} />

      <View style={styles.timeContainer}>
        <Text variant="bodySmall">{formatTime(status.currentTime)}</Text>
        <Text variant="bodySmall">{formatTime(status.duration)}</Text>
      </View>

      <View style={styles.controls}>
        <Button
          mode="contained"
          onPress={togglePlayPause}
          icon={status.playing ? "pause" : "play"}
          disabled={isLoading}
          loading={isLoading}
        >
          {status.playing ? "Pausa" : "Spela"}
        </Button>

        {status.playing && (
          <Button mode="outlined" onPress={handleStop} icon="stop">
            Stoppa
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 26,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressBar: {
    height: 4,
    marginVertical: 18,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  controls: {
    flexDirection: "row",
    alignContent: "center",
    gap: 8,
  },
  error: {
    color: "red",
    marginTop: 8,
  },
});
