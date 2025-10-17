import SegmentedButtonsComponent from "@/components/chore-details/segmented-button";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { useChoreOperations } from "@/hooks/useChoreOperations";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
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
    isCompleted,
    toggleCompletion,
    updateChoreData,
    deleteChore,
  } = useChoreOperations();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handlePressDelete = () => {
    if (selectedChore) {
      deleteChore(selectedChore.id);
    }
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

  return isEditing ? (
    <Surface style={s.container} elevation={4}>
      <View style={s.contentContainer}>
        <View style={s.choreNameContainer}>
          <Text style={s.choreName}>{selectedChore?.name}</Text>
          <Pressable onPress={handlePressDelete}>
            <Icon source="trash-can-outline" color="000" size={20} />
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
                  <SegmentedButtonsComponent
                    value={value?.toString() || ""}
                    onValueChange={(newValue) =>
                      onChange(parseInt(newValue) || 0)
                    }
                    options={[
                      { value: "1", label: "1" },
                      { value: "2", label: "2" },
                      { value: "3", label: "3" },
                      { value: "4", label: "4" },
                      { value: "5", label: "5" },
                      { value: "6", label: "6" },
                      { value: "7", label: "7" },
                    ]}
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
                <View>
                  <Text style={s.editText}>Värde (poäng)</Text>
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

      <View style={s.saveCancelButtonsContainer}>
        <CustomPaperButton
          onPress={handleSubmit(onSubmit)}
          text="Spara"
          icon="content-save"
          disabled={isSubmitting}
          mode="contained"
        />
        <CustomPaperButton
          onPress={() => setIsEditing(false)}
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
            <Pressable onPress={() => setIsEditing(true)}>
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
      <View style={s.doneButtonsContainer}>
        <CustomPaperButton
          onPress={() => toggleCompletion(selectedChore!.id)}
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
  doneButtonsContainer: {
    flexDirection: "row",
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
  editText: {
    fontSize: 14,
    fontWeight: "bold",
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
    color: "#d03f3fff",
    fontSize: 12,
    marginLeft: 12,
  },
});
