import { createNewHousehold } from "@/api/households";
import { addNewMemberToHousehold } from "@/api/members";
import { AvatarPressablePicker } from "@/components/avatar-pressable-picker";
import { avatarColors } from "@/data/avatar-index";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, Text, TextInput } from "react-native-paper";
import { z } from "zod";

// Extraherar alla emojis från avatarColors-arrayen för validering
export const avatarEmojis = avatarColors.map((a) => a.emoji) as [
  string,
  ...string[],
];

const newHouseHold = z.object({
  householdName: z
    .string({ required_error: "Namnge hushållet!" })
    .min(1, "Namnet måste vara minst 1 tecken!"),
  avatar: z.enum(avatarEmojis, {
    errorMap: () => ({ message: "Välj en avatar!" }),
  }),
  nickName: z
    .string({ required_error: "Ange ett smeknamn!" })
    .min(1, "Ditt smeknamn måste vara minst 1 tecken!"),
});

type FormFields = z.infer<typeof newHouseHold>;

export default function CreateHousholdScreen() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(newHouseHold),
    defaultValues: {},
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const householdId = await createNewHousehold(data.householdName);
      // Hitta avatar-objektet som matchar vald emoji
      const selectedAvatar = avatarColors.find((a) => a.emoji === data.avatar);
      if (!selectedAvatar) {
        return;
      }

      await addNewMemberToHousehold(
        householdId,
        selectedAvatar,
        data.nickName,
        false, // isPaused
        true, // IsOwner
        "active", // Status
      );
      reset();
      router.replace("/(protected)");
    } catch (error) {
      console.error("Error creating household:", error);
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
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Text style={s.title}>Hushållets namn:</Text>
              <TextInput
                placeholder="Hushållets namn"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="words"
              />
            </View>
          )}
          name="householdName"
        />
        {errors.householdName && (
          <Text style={s.errorText}>{errors.householdName.message}</Text>
        )}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Text style={s.title}>Smeknamn:</Text>
              <TextInput
                placeholder="Smeknamn"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="words"
              />
            </View>
          )}
          name="nickName"
        />
        {errors.nickName && (
          <Text style={s.errorText}>{errors.nickName.message}</Text>
        )}
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <View>
              <Text style={s.title}>Välj din avatar:</Text>
              <AvatarPressablePicker
                onChange={(avatar) => onChange(avatar.emoji)}
                value={avatarColors.find((a) => a.emoji === value)}
                avatars={avatarColors}
              />
            </View>
          )}
          name="avatar"
        />
        {errors.avatar && (
          <Text style={s.errorText}>{errors.avatar.message}</Text>
        )}
        <Button
          mode="contained"
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        >
          Skapa
        </Button>
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
    gap: 10,
  },
  title: {
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: 700,
  },
  errorText: {
    fontSize: 15,
    fontWeight: 700,
    color: "red",
  },
});
