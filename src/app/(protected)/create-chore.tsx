import { CustomPaperButton } from "@/components/custom-paper-button";
import { useChoreOperations } from "@/hooks/useChoreOperations";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Surface, useTheme, TextInput, Text } from "react-native-paper";
import z from "zod";

const newChore = z.object({
  name: z
    .string({ required_error: "Namnge sysslan" })
    .min(1, "Namnet måste vara minst 1 tecken"),
  description: z.string().optional(),
  frequency: z
    .number({ required_error: "Ange hur ofta sysslan ska göras" })
    .min(1, "Frekvensen måste vara minst 1 dag"),
  effort: z
    .number({ required_error: "Ange hur mycket ansträngning sysslan kräver" })
    .min(1, "Ansträngningen måste vara minst 1"),
});

type ChoreFormData = z.infer<typeof newChore>;

export default function CreateChoreScreen() {
  const { createChore, householdId } = useChoreOperations();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChoreFormData>({
    resolver: zodResolver(newChore),
    defaultValues: {      
      name: "",
      description: "",
      frequency: 1,
      effort: 1,},
    mode: "onBlur",
  });
  const theme = useTheme();

  const onSubmit = async (data: ChoreFormData) => {
    if (!householdId) return;
    setSubmitting(true);

    try {
      await createChore({
        name: data.name.trim(),
        description: data.description?.trim() ?? "",
        frequency: data.frequency,
        effort: data.effort,
      });
      reset();
      router.replace("/(protected)/(top-tabs)/day-view");
    } catch (e) {
      console.error("createChore failed:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={s.scrollContent}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <View style={s.container}>
        <Surface style={s.surface}>
          <Text style={s.surfaceTitle}>Skapa ny syssla!</Text>
          <Text style={s.surfaceSubText}>Fyll i uppgifterna nedan</Text>
        </Surface>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                mode="outlined"
                theme={{ roundness: 8 }}
                label="Titel"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="sentences"
                error={!!errors.name}
              />
            </View>
          )}
          name="name"
        />
        {errors.name && (
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            {errors.name.message}
          </Text>
        )}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                label="Beskrivning (valfritt)"
                mode="outlined"
                theme={{ roundness: 8 }}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="sentences"
                multiline
              />
            </View>
          )}
          name="description"
        />
        {errors.description && (
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            {errors.description.message}
          </Text>
        )}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
            <TextInput
              label="Frekvens (dagar)*"
              mode="outlined"
              theme={{ roundness: 8 }}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={String(value ?? "")}
              error={!!errors.frequency}
              />
            </View>
          )}
          name="frequency"
        />
        {errors.frequency && (
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            {errors.frequency.message}
          </Text>
        )}
                <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
            <TextInput
              label="Ansträngning (1–5)*"
              mode="outlined"
              theme={{ roundness: 8 }}
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={String(value ?? "")}
              error={!!errors.effort}
            />
            </View>
          )}
          name="effort"
        />
        {errors.effort && (
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            {errors.effort.message}
          </Text>
        )}
        <CustomPaperButton
          text="Skapa"
          mode="contained"
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}

const s = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    padding: 20,
    gap: 20,
  },
  title: {
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: 700,
    fontSize: 15,
  },
  errorText: {
    fontSize: 15,
    fontWeight: 700,
  },
  surface: {
    elevation: 4,
    borderRadius: 20,
    padding: 20,
  },
  surfaceTitle: {
    paddingTop: 5,
    paddingBottom: 10,
    fontWeight: 700,
    fontSize: 20,
  },
  surfaceText: {
    fontSize: 18,
    fontWeight: 600,
    paddingBottom: 5,
  },
  surfaceSubText: {
    fontSize: 15,
    fontWeight: 600,
    paddingBottom: 5,
    fontStyle: "italic",
  },
});
