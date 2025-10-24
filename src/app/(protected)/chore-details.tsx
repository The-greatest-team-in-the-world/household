import AlertDialog from "@/components/alertDialog";
import ChoreForm, {
  ChoreFormData,
} from "@/components/chore-details/chore-form";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { useChoreOperations } from "@/hooks/useChoreOperations";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import getMemberAvatar from "@/utils/get-member-avatar";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Divider, Icon, Surface, Text } from "react-native-paper";

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

  useEffect(() => {}, [selectedChore]);

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

  if (isEditing && selectedChore) {
    return (
      <>
        <ChoreForm
          title={selectedChore.name}
          defaultValues={{
            name: selectedChore.name ?? "",
            description: selectedChore.description ?? "",
            frequency: selectedChore.frequency ?? 0,
            effort: selectedChore.effort ?? 1,
          }}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={() => setIsEditing(false)}
          onRequestDelete={handlePressDelete}
        />

        <AlertDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          headLine="Vill du verkligen ta bort sysslan?"
          alertMsg="Vill du arkivera sysslan eller ta bort den permanent? Om du tar bort permanent så försvinner all historik."
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
      </>
    );
  }

  // ---- visningsläge (oförändrat) ----
  return (
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
            <Text style={s.textMedium}>{selectedChore?.description}</Text>
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
    marginBottom: 10,
  },
  descriptionsContainer: {
    padding: 10,
    gap: 5,
    borderRadius: 8,
  },
  textContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
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
  textMedium: {
    fontSize: 24,
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
