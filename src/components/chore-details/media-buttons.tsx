import { useChoreOperations } from "@/hooks/useChoreOperations";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { CustomPaperButton } from "../custom-paper-button";
import AudioModal from "./audio-modal";

type Props = {
  header: string;
};

export default function MediaButtons({ header }: Props) {
  const { selectedChore, householdId, updateChoreData } = useChoreOperations();
  const [audiomodalVisible, setAudiomodalVisible] = useState(false);

  const handlePressAudio = () => {
    setAudiomodalVisible(true);
  };

  const handlePressImage = () => {};

  return (
    <View>
      <Text style={s.headerText}>{header}</Text>
      <View style={s.container}>
        <CustomPaperButton
          onPress={() => handlePressAudio()}
          text={"Ljud"}
          icon="music-note"
          mode={selectedChore?.audioUrl ? "contained-tonal" : "outlined"}
        />
        <CustomPaperButton
          onPress={() => handlePressImage()}
          text={"Bild"}
          icon="image"
          mode={selectedChore?.imageUrl ? "contained-tonal" : "outlined"}
        />
        <AudioModal
          visible={audiomodalVisible}
          onDismiss={() => setAudiomodalVisible(false)}
          householdId={householdId}
          choreId={selectedChore?.id || ""}
          onAudioSaved={(audioUrl) => {
            updateChoreData({ audioUrl });
            setAudiomodalVisible(false);
          }}
          onAudioDeleted={() => {
            updateChoreData({ audioUrl: null });
          }}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
