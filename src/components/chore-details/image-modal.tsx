import { deleteImageFromFirebase, uploadImageToFirebase } from "@/api/image";
import { selectedChoreAtom } from "@/atoms/chore-atom";
import { currentHouseholdAtom } from "@/atoms/household-atom";
import { Image } from "expo-image";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { Icon, Portal, Surface, Text, useTheme } from "react-native-paper";
import { CustomPaperButton } from "../custom-paper-button";
import ImageButtons from "./image-buttons";

export default function ImageModal({
  visible,
  onDismiss,
  onImageSaved,
  onImageDeleted,
  isCreating,
}: {
  visible: boolean;
  onDismiss: () => void;
  onImageSaved: (imageUrl: string) => void;
  onImageDeleted?: () => void;
  isCreating?: boolean;
}) {
  const theme = useTheme();
  const [selectedChore] = useAtom(selectedChoreAtom);
  const currentHousehold = useAtomValue(currentHouseholdAtom);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentImageUrl = isCreating ? null : selectedChore?.imageUrl;
  const displayImageUrl = previewImageUrl || currentImageUrl;

  const handleImageSelected = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
  };

  const handleSaveImage = async () => {
    if (previewImageUrl) {
      setIsUploading(true);
      try {
        const firebaseUrl = await uploadImageToFirebase(
          previewImageUrl,
          currentHousehold!.id,
          selectedChore!.id,
        );

        onImageSaved(firebaseUrl);
        setPreviewImageUrl(null);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDeleteImage = async () => {
    if (onImageDeleted && currentImageUrl) {
      setIsUploading(true);
      try {
        await deleteImageFromFirebase(currentImageUrl);
        onImageDeleted();
        setPreviewImageUrl(null);
      } catch (error) {
        console.error("Error deleting image:", error);
        console.log("Current image URL:", currentImageUrl);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDismiss = () => {
    setPreviewImageUrl(null);
    onDismiss();
  };

  return (
    <Portal>
      <Modal visible={visible} onRequestClose={handleDismiss}>
        <Surface
          style={[styles.surface, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="displaySmall" style={styles.header}>
            {currentImageUrl ? "Ändra bild" : "Lägg till bild"}
          </Text>
          <Text variant="labelLarge" style={styles.header}>
            Vald syssla: {selectedChore?.name}
          </Text>

          {displayImageUrl ? (
            <Image source={{ uri: displayImageUrl }} style={styles.image} />
          ) : (
            <View style={styles.iconContainer}>
              <Icon
                source="image-off"
                size={120}
                color={theme.colors.outline}
              />
              <Text variant="bodyMedium" style={styles.noImageText}>
                Ingen bild vald
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <ImageButtons onImageSelected={handleImageSelected} />
          </View>

          {/* Visa spara-knapp om en ny bild har valts */}
          {previewImageUrl && (
            <CustomPaperButton
              mode="contained"
              text={isUploading ? "Laddar upp..." : "Spara bild"}
              icon="content-save"
              onPress={handleSaveImage}
              style={styles.saveButton}
              disabled={isUploading}
            />
          )}
          <View style={styles.buttonContainer}>
            {/* Visa radera-knapp om det finns en befintlig bild */}
            {currentImageUrl && !previewImageUrl && (
              <CustomPaperButton
                mode="outlined"
                text={isUploading ? "Raderar..." : "Ta bort bild"}
                icon="delete"
                onPress={handleDeleteImage}
                disabled={isUploading}
                style={{ flex: 1 }}
              />
            )}

            <CustomPaperButton
              mode={previewImageUrl ? "text" : "outlined"}
              text={previewImageUrl ? "Avbryt" : "Stäng"}
              icon="close"
              onPress={handleDismiss}
              disabled={isUploading}
              style={{ flex: 1 }}
            />
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    padding: 24,
    paddingVertical: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: "50%",
    resizeMode: "contain",
  },
  iconContainer: {
    width: "100%",
    height: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 16,
    opacity: 0.6,
  },
  section: {
    marginVertical: 10,
    width: "100%",
  },
  saveButton: {
    marginTop: 10,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 10,
  },
});
