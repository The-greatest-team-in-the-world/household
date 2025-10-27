import SegmentedButtonsComponent from "@/components/chore-details/segmented-button";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { HouseholdMember } from "@/types/household-member";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Icon, Surface, Text, TextInput } from "react-native-paper";
import MediaButtons from "./media-buttons";
import MemberSelector from "./member-selector";

export type ChoreFormData = {
  name: string;
  description: string;
  frequency: number;
  effort: number;
  assignedTo?: string | null;
};

type Props = {
  title: string;
  defaultValues: ChoreFormData;
  isSubmitting?: boolean;
  onSubmit: (data: ChoreFormData) => void;
  onCancel: () => void;
  onRequestDelete?: () => void;
  showDelete?: boolean;
  mode?: "onBlur" | "onChange" | "onSubmit" | "onTouched" | "all";
  isCreating?: boolean;
  members?: HouseholdMember[];
};

export default function ChoreForm({
  title,
  defaultValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
  onRequestDelete,
  showDelete = true,
  mode = "onBlur",
  isCreating,
  members,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChoreFormData>({
    defaultValues,
    mode,
  });

  // Om defaultValues ändras (t.ex. när selectedChore byts), resetta formuläret:
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const frequencyScrollRef = useRef<ScrollView>(null);

  // Scrolla till valt frequency värde vid mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const frequency = defaultValues.frequency;
      if (frequency && frequency > 5) {
        // Varje knapp är ca 45px bred, scrolla så att valt värde syns
        const scrollPosition = (frequency - 3) * 45;
        frequencyScrollRef.current?.scrollTo({
          x: Math.max(0, scrollPosition),
          animated: true,
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [defaultValues.frequency]);

  return (
    <Surface style={s.container} elevation={4}>
      <View style={s.contentContainer}>
        <View style={s.choreNameContainer}>
          <Text style={s.choreName}>{title}</Text>
          {showDelete && onRequestDelete && (
            <Pressable onPress={onRequestDelete} accessibilityLabel="Ta bort">
              <Icon source="trash-can-outline" size={25} />
            </Pressable>
          )}
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
                    multiline
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
                  <ScrollView
                    ref={frequencyScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
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
            {members && members.length > 0 && (
              <Controller
                control={control}
                name="assignedTo"
                render={({ field: { onChange, value } }) => (
                  <MemberSelector
                    members={members}
                    value={value || null}
                    onValueChange={onChange}
                    error={errors.assignedTo?.message}
                  />
                )}
              />
            )}
            <MediaButtons header="Lägg till media" isCreating={isCreating} />
          </View>
        </KeyboardAwareScrollView>
      </View>
      <View style={s.saveCancelButtonsContainer}>
        <CustomPaperButton
          onPress={onCancel}
          text="Avbryt"
          icon="close"
          disabled={isSubmitting}
          mode="outlined"
          style={{ flex: 1 }}
        />
        <CustomPaperButton
          onPress={handleSubmit(onSubmit)}
          text="Spara"
          icon="content-save"
          disabled={isSubmitting}
          mode="contained"
          style={{ flex: 1 }}
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
  choreNameContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  choreName: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },
  formContainer: {
    gap: 16,
  },
  saveCancelButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
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
  errorText: {
    fontSize: 12,
    marginLeft: 12,
  },
});
