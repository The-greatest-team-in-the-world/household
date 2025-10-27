import { useChoreOperations } from "@/hooks/useChoreOperations";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { CustomPaperButton } from "../custom-paper-button";
import AudioModal from "./audio-modal";
import ImageModal from "./image-modal";

type Props = {
  header: string;
  isCreating?: boolean;
};

export default function MediaButtons({ header, isCreating }: Props) {
  const { selectedChore, householdId, updateChoreData } = useChoreOperations();
  const [audiomodalVisible, setAudiomodalVisible] = useState(false);
  const [imagemodalVisible, setImagemodalVisible] = useState(false);

  // Om vi skapar ny syssla, använd null istället för selectedChore
  const chore = isCreating ? null : selectedChore;

  const handlePressAudio = () => {
    setAudiomodalVisible(true);
  };

  const handlePressImage = () => {
    setImagemodalVisible(true);
  };

  return (
    <View>
      <Text style={s.headerText}>{header}</Text>
      <View style={s.container}>
        <CustomPaperButton
          onPress={() => handlePressAudio()}
          text={"Ljud"}
          icon="music-note"
          mode={chore?.audioUrl ? "contained-tonal" : "outlined"}
        />
        <CustomPaperButton
          onPress={() => handlePressImage()}
          text={"Bild"}
          icon="image"
          mode={chore?.imageUrl ? "contained-tonal" : "outlined"}
        />
        <AudioModal
          visible={audiomodalVisible}
          onDismiss={() => setAudiomodalVisible(false)}
          householdId={householdId}
          choreId={chore?.id || ""}
          isCreating={isCreating}
          onAudioSaved={(audioUrl) => {
            updateChoreData({ audioUrl });
            setAudiomodalVisible(false);
          }}
          onAudioDeleted={() => {
            updateChoreData({ audioUrl: null });
          }}
        />
        <ImageModal
          visible={imagemodalVisible}
          onDismiss={() => setImagemodalVisible(false)}
          isCreating={isCreating}
          onImageSaved={(imageUrl) => {
            updateChoreData({ imageUrl });
            setImagemodalVisible(false);
          }}
          onImageDeleted={() => {
            updateChoreData({ imageUrl: null });
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
