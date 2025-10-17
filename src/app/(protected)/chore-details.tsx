import {
  addChoreCompletion,
  deleteChoreCompletion,
  getAllCompletions,
} from "@/api/chore-completions";
import { updateChore } from "@/api/chores";
import { selectedChoreAtom } from "@/atoms/chore-atom";
import { choreCompletionsAtom } from "@/atoms/chore-completion-atom";
import { currentHouseholdMember } from "@/atoms/member-atom";
import SegmentedButtonsComponent from "@/components/chore-details/segmented-button";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { isChoreCompletedToday } from "@/utils/chore-helpers";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
import { Divider, Icon, Surface, Text, TextInput } from "react-native-paper";

// När man trycker bakåtknapp landar vi inte på day-view utan hushållsvyn

type ChoreFormData = {
  name: string;
  description: string;
  frequency: number;
  effort: number;
};

export default function ChoreDetailsScreen() {
  const selectedChore = useAtomValue(selectedChoreAtom);
  const currentMember = useAtomValue(currentHouseholdMember);
  const choreCompletions = useAtomValue(choreCompletionsAtom);
  const setCompletions = useSetAtom(choreCompletionsAtom);
  const setSelectedChore = useSetAtom(selectedChoreAtom);
  const householdId = currentMember?.householdId || "";
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Kolla om sysslan är klar baserat på dagens completions
  useEffect(() => {
    if (!selectedChore || !currentMember) return;

    const isCompleted = isChoreCompletedToday(
      selectedChore.id,
      currentMember.userId,
      choreCompletions,
    );

    setIsCompleted(isCompleted);
  }, [selectedChore, currentMember, choreCompletions]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChoreFormData>({
    defaultValues: {
      name: selectedChore?.name || "",
      description: selectedChore?.description || "",
      frequency: selectedChore?.frequency || 0,
      effort: selectedChore?.effort || 1,
    },
  });

  // console.log("is owner:", currentMember?.isOwner);

  const handleToggleCompletion = async (choreId: string) => {
    if (!currentMember) return;

    if (!isCompleted) {
      // Markera som klar
      console.log("Markera som klar");
      await addChoreCompletion(householdId, choreId);
      const updatedCompletions = await getAllCompletions(householdId);
      setCompletions(updatedCompletions);
      setIsCompleted(true);
    } else {
      // Ta bort klarmarkering
      console.log("Ta bort klarmarkering");
      await deleteChoreCompletion(householdId, choreId, currentMember.userId);
      const updatedCompletions = await getAllCompletions(householdId);
      setCompletions(updatedCompletions);
      setIsCompleted(false);
    }
  };

  const handlePressDelete = () => {
    console.log("Ta bort syssla");
  };

  const handlePressEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const onSubmit = async (data: ChoreFormData) => {
    if (!selectedChore) return;

    setIsSubmitting(true);
    try {
      await updateChore(householdId, selectedChore.id, {
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        effort: data.effort,
      });

      // Uppdatera selectedChore atom med nya värden
      setSelectedChore({
        ...selectedChore,
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        effort: data.effort,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating chore:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return isEditing ? (
    <Surface style={s.container} elevation={4}>
      <View style={s.contentContainer}>
        <View style={s.choreNameContainer}>
          <Text style={s.choreName}>{selectedChore?.name}</Text>
          <Pressable onPress={handlePressDelete}>
            <Icon source="trash-can-outline" color="000" size={20} />
          </Pressable>
        </View>
        <View style={s.formContainer}>
          <Controller
            control={control}
            name="name"
            rules={{ required: "Namn är obligatoriskt" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={s.inputContainer}>
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
              <View style={s.inputContainer}>
                <TextInput
                  label="Beskrivning"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  error={!!errors.description}
                />
                {errors.description && (
                  <Text style={s.errorText}>{errors.description.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="frequency"
            rules={{
              required: "Frekvens är obligatoriskt",
              min: { value: 1, message: "Frekvens måste vara minst 1" },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={s.inputContainer}>
                <TextInput
                  label="Återkommer var (dagar)"
                  value={value?.toString() || ""}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  onBlur={onBlur}
                  mode="outlined"
                  keyboardType="numeric"
                  error={!!errors.frequency}
                />
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
              <View style={s.inputContainer}>
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
      </View>

      <View style={s.editButtonsContainer}>
        <CustomPaperButton
          onPress={handleSubmit(onSubmit)}
          text="Spara"
          icon="content-save"
          disabled={isSubmitting}
          mode="contained"
        />
        <CustomPaperButton
          onPress={handleCancelEdit}
          text="Avbryt"
          icon="close"
          disabled={isSubmitting}
          mode="outlined"
        />
      </View>
    </Surface>
  ) : (
    <Surface style={s.container} elevation={4}>
      <View style={s.contentContainer}>
        <View style={s.choreNameContainer}>
          <Text style={s.choreName}>{selectedChore?.name}</Text>
          {currentMember?.isOwner && (
            <Pressable onPress={handlePressEdit}>
              <Icon source="file-document-edit-outline" color="000" size={20} />
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
      <View style={s.doneEditButtonsContainer}>
        <CustomPaperButton
          onPress={() => handleToggleCompletion(selectedChore!.id)}
          text="Inte klar"
          icon="check"
          disabled={isSubmitting}
          mode="outlined"
          style={{ minWidth: "100%" }}
          isToggle={true}
          isToggled={isCompleted}
          toggledIcon="check-circle"
          toggledText="Klar"
          toggledMode="contained"
        />
      </View>
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: "#e2e2e2ff",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: "space-between",
  },
  contentContainer: {
    flex: 1,
  },
  doneEditButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  editButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  button: {
    minWidth: 200,
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
    backgroundColor: "#ffffff5f",
    borderRadius: 8,
  },
  textContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#ffffff5f",
    borderRadius: 8,
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
  titleText: {
    fontSize: 18,
    padding: 2,
    fontWeight: "bold",
  },
  formContainer: {
    gap: 16,
    marginTop: 16,
  },
  inputContainer: {
    gap: 4,
  },
  errorText: {
    color: "#d03f3fff",
    fontSize: 12,
    marginLeft: 12,
  },
});
