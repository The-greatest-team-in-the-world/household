import AlertDialog from "@/components/alertDialog";
import AudioModal from "@/components/chore-details/audio-modal";
import SegmentedButtonsComponent from "@/components/chore-details/segmented-button";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { useChoreOperations } from "@/hooks/useChoreOperations";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import getMemberAvatar from "@/utils/get-member-avatar";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Divider, Icon, Surface, Text, TextInput } from "react-native-paper";

type ChoreFormData = {
  name: string;
  description: string;
  frequency: number;
  effort: number;
};

export default function ChoreDetailsScreen() {
  const {
    selectedChore,
    currentMember,
    submitChoreCompletion,
    removeChoreCompletion,
    updateChoreData,
    softDeleteChore,
    deleteChore,
    householdId,
  } = useChoreOperations();

  const { members } = useHouseholdData(householdId || "");

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [audiomodalVisible, setAudiomodalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChoreFormData>({
    defaultValues: {
      name: selectedChore?.name || "",
      description: selectedChore?.description || "",
      frequency: selectedChore?.frequency || 0,
      effort: selectedChore?.effort || 1,
    },
  });

  useEffect(() => {
    if (selectedChore) {
      reset({
        name: selectedChore.name,
        description: selectedChore.description,
        frequency: selectedChore.frequency || 0,
        effort: selectedChore.effort,
      });
    }
  }, [selectedChore, reset]);

  const handlePressDone = () => {
    if (selectedChore) {
      submitChoreCompletion(selectedChore.id);
      router.back();
    }
  };
  const handlePressRemoveCompletion = () => {
    if (selectedChore) {
      removeChoreCompletion(selectedChore.id);
      router.back();
    }
  };

  const handlePressDelete = () => {
    setDialogOpen(true);
  };

  const onSubmit = async (data: ChoreFormData) => {
    if (!selectedChore) return;

    setIsSubmitting(true);
    try {
      await updateChoreData(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating chore:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePressAudio = () => {
    setAudiomodalVisible(true);
  };

  const handlePressImage = () => {};

  console.log("selected chore audio url", selectedChore?.audioUrl);

  return isEditing ? (
    <Surface style={s.container} elevation={4}>
      <View style={s.contentContainer}>
        <View style={s.choreNameContainer}>
          <Text style={s.choreName}>{selectedChore?.name}</Text>
          <Pressable onPress={handlePressDelete}>
            <Icon source="trash-can-outline" size={25} />
          </Pressable>
        </View>
        <KeyboardAwareScrollView>
          <View style={s.formContainer}>
            <Controller
              control={control}
              name="name"
              rules={{ required: "Namn är obligatoriskt" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    label="Namn"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    error={!!errors.name}
                  />
                  {errors.name && (
                    <Text style={s.errorText}>{errors.name.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="description"
              rules={{ required: "Beskrivning är obligatoriskt" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    label="Beskrivning"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    multiline={true}
                    numberOfLines={4}
                    error={!!errors.description}
                  />
                  {errors.description && (
                    <Text style={s.errorText}>
                      {errors.description.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="frequency"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text style={s.editText}>Återkommer var (dagar)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <SegmentedButtonsComponent
                      value={value?.toString() || ""}
                      onValueChange={(newValue) =>
                        onChange(parseInt(newValue) || 0)
                      }
                      options={Array.from({ length: 30 }, (_, i) => {
                        const val = (i + 1).toString();
                        return { value: val, label: val };
                      })}
                    />
                  </ScrollView>
                  {errors.frequency && (
                    <Text style={s.errorText}>{errors.frequency.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="effort"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text style={s.editText}>Värde</Text>
                  <Text style={s.helpText}>Hur energikrävande är sysslan?</Text>
                  <SegmentedButtonsComponent
                    value={value?.toString() || ""}
                    onValueChange={(newValue) =>
                      onChange(parseInt(newValue) || 0)
                    }
                  />
                  {errors.effort && (
                    <Text style={s.errorText}>{errors.effort.message}</Text>
                  )}
                </View>
              )}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
      <AlertDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        headLine="Vill du verkligen ta bort sysslan?"
        alertMsg={`Vill du arkivera sysslan eller ta bort den permanent? Om du tar bort sysslan permanent så försvinner all historik kopplad till den.`}
        agreeText="Ta bort"
        secondOption="Arkivera"
        disagreeText="Avbryt"
        agreeAction={() => {
          if (selectedChore) {
            deleteChore();
            setDialogOpen(false);
            router.replace("/(protected)/(top-tabs)/day-view");
          }
        }}
        secondOptionAction={() => {
          if (selectedChore) {
            softDeleteChore();
            setDialogOpen(false);
            router.replace("/(protected)/(top-tabs)/day-view");
          }
        }}
      />

      <View style={s.saveCancelButtonsContainer}>
        <CustomPaperButton
          onPress={() => setIsEditing(false)}
          text="Avbryt"
          icon="close"
          disabled={isSubmitting}
          mode="outlined"
        />
        <CustomPaperButton
          onPress={handleSubmit(onSubmit)}
          text="Spara"
          icon="content-save"
          disabled={isSubmitting}
          mode="contained"
        />
      </View>
    </Surface>
  ) : (
    <Surface style={s.container} elevation={4}>
      <View style={s.contentContainer}>
        <View style={s.choreNameContainer}>
          <Text style={s.choreName}>{selectedChore?.name}</Text>
          {currentMember?.isOwner && (
            <Pressable onPress={() => setIsEditing(true)}>
              <Icon source="file-document-edit-outline" size={25} />
            </Pressable>
          )}
        </View>
        <Divider />
        <View style={s.secondContainer}>
          <View style={s.descriptionsContainer}>
            <Text style={s.titleText}>Beskrivning</Text>
            <ScrollView
              fadingEdgeLength={20}
              style={{
                maxHeight: 130,
                padding: 8,
                borderRadius: 8,
              }}
            >
              <Text style={s.text}>{selectedChore?.description}</Text>
            </ScrollView>
          </View>
          <Divider />
          <View style={s.textContainer}>
            <Text style={s.titleText}>Senast gjord: </Text>
            <View style={s.dateAvatarContainer}>
              <Text style={s.text}>
                {selectedChore?.lastCompletedAt
                  ? selectedChore.lastCompletedAt
                      .toDate()
                      .toLocaleDateString("sv-SE")
                  : "Aldrig"}
              </Text>
              {selectedChore?.lastCompletedBy && (
                <Text style={s.avatarText}>
                  {
                    getMemberAvatar(members, selectedChore.lastCompletedBy)
                      .emoji
                  }
                </Text>
              )}
            </View>
          </View>
          <Divider />
          <View style={s.textContainer}>
            <Text style={s.titleText}>Återkommer var: </Text>
            <Text style={s.text}>{selectedChore?.frequency} dag</Text>
          </View>
          <Divider />
          <View style={s.textContainer}>
            <Text style={s.titleText}>Värde: </Text>
            <Text style={s.text}>{selectedChore?.effort}</Text>
          </View>
          <Divider />
          <View style={s.audioImageContainer}>
            <CustomPaperButton
              onPress={() => handlePressAudio()}
              text={selectedChore?.audioUrl ? "Ljud ✓" : "Ljud"}
              icon="music-note"
              mode={selectedChore?.audioUrl ? "contained" : "contained-tonal"}
            />
            <CustomPaperButton
              onPress={() => handlePressImage()}
              text={selectedChore?.imageUrl ? "Bild ✓" : "Bild"}
              icon="image"
              mode={selectedChore?.imageUrl ? "contained" : "contained-tonal"}
            />
          </View>
        </View>
      </View>
      <View style={s.doneButtonsContainer}>
        <CustomPaperButton
          onPress={() => handlePressRemoveCompletion()}
          text="Markera som inte klar"
          icon="undo"
          mode="outlined"
        />
        <CustomPaperButton
          onPress={() => handlePressDone()}
          text="Markera som klar"
          icon="check"
          mode="contained"
        />
      </View>
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
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: "space-between",
  },
  contentContainer: {
    flex: 1,
  },
  doneButtonsContainer: {
    justifyContent: "center",
    gap: 10,
  },
  saveCancelButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  choreNameContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  audioImageContainer: {
    justifyContent: "space-evenly",
    flexDirection: "row",
    marginTop: 5,
  },
  descriptionsContainer: {
    gap: 5,
    borderRadius: 8,
  },
  textContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 8,
  },
  dateAvatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secondContainer: {
    gap: 10,
    marginTop: 20,
  },
  choreName: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },
  text: {
    fontSize: 18,
    padding: 2,
  },
  avatarText: {
    fontSize: 24,
  },
  editText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  helpText: {
    fontSize: 12,
    marginBottom: 5,
  },
  titleText: {
    fontSize: 18,
    padding: 2,
    fontWeight: "bold",
  },
  formContainer: {
    gap: 16,
    marginTop: 16,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 12,
  },
});
