import { addChoreCompletion, getAllCompletions } from "@/api/chore-completions";
import { updateChore } from "@/api/chores";
import { selectedChoreAtom } from "@/atoms/chore-atom";
import { choreCompletionsAtom } from "@/atoms/chore-completion-atom";
import { currentHouseholdMember } from "@/atoms/member-atom";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Divider, Surface, Text, TextInput } from "react-native-paper";

// När man trycker bakåtknapp landar vi inte på day-view utan hushållsvyn

type ChoreFormData = {
  name: string;
  description: string;
  frequency: number;
  effort: number;
};

export default function ChoreDetailsScreen() {
  const selectedChore = useAtomValue(selectedChoreAtom);
  const currentUser = useAtomValue(currentHouseholdMember);
  const setCompletions = useSetAtom(choreCompletionsAtom);
  const householdId = currentUser?.householdId || "";
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChoreFormData>({
    defaultValues: {
      name: selectedChore?.name || "",
      description: selectedChore?.description || "",
      frequency: selectedChore?.frequency || 0,
      effort: selectedChore?.effort || 0,
    },
  });

  const handlePressDone = async (choreId: string) => {
    await addChoreCompletion(householdId, choreId);
    const updatedCompletions = await getAllCompletions(householdId);
    setCompletions(updatedCompletions);
    // TODO : Navigera tillbaka till day-view
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
      setIsEditing(false);
      // TODO: Update the atom or refetch the chore data
    } catch (error) {
      console.error("Error updating chore:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return isEditing ? (
    <Surface style={s.container} elevation={4}>
      <View style={s.contentContainer}>
        <Text style={s.choreName}>{selectedChore?.name}</Text>
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
            rules={{
              required: "Värde är obligatoriskt",
              min: { value: 1, message: "Värde måste vara minst 1" },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={s.inputContainer}>
                <TextInput
                  label="Värde"
                  value={value?.toString() || ""}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  onBlur={onBlur}
                  mode="outlined"
                  keyboardType="numeric"
                  error={!!errors.effort}
                />
                {errors.effort && (
                  <Text style={s.errorText}>{errors.effort.message}</Text>
                )}
              </View>
            )}
          />
        </View>
      </View>

      <View style={s.buttonsContainer}>
        <CustomPaperButton
          onPress={handleSubmit(onSubmit)}
          text="Spara ändringar"
          icon="content-save"
          color="#06BA63"
          style={{ minWidth: 220 }}
          disabled={isSubmitting}
        />
        <CustomPaperButton
          onPress={handleCancelEdit}
          text="Avbryt"
          icon="close"
          color="#808080"
          style={{ minWidth: 220 }}
          disabled={isSubmitting}
        />
      </View>
    </Surface>
  ) : (
    <Surface style={s.container} elevation={4}>
      <View style={s.contentContainer}>
        <View style={s.choreNameContainer}>
          <Text style={s.choreName}>{selectedChore?.name}</Text>
          {currentUser?.isOwner && <Text style={s.choreName}>👑</Text>}
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
      <View style={s.buttonsContainer}>
        <CustomPaperButton // TODO om sysslan inte är klar redan visa knapp för att markera som klar
          onPress={() => handlePressDone(selectedChore!.id)}
          text="Markera som klar"
          icon="check"
          color="#06BA63"
          style={{ minWidth: 220 }}
        />
        {currentUser?.isOwner && (
          <CustomPaperButton
            onPress={handlePressDelete}
            text="Ta bort syssla"
            icon="trash-can"
            color="#d03f3fff"
            style={{ minWidth: 220 }}
          />
        )}
        {currentUser?.isOwner && (
          <CustomPaperButton
            onPress={handlePressEdit}
            text="Redigera"
            icon="application-edit"
            color="#3179ffff"
            style={{ minWidth: 220 }}
          />
        )}
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
  buttonsContainer: {
    alignItems: "center",
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
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
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
