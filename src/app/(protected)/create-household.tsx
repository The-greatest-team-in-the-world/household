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

export const avatarEmojis = Object.keys(avatarColors) as [
  keyof typeof avatarColors,
  ...(keyof typeof avatarColors)[],
];

const newHouseHold = z.object({
  householdName: z.string().min(1, "Namnge hushållet"),
  avatar: z.enum(avatarEmojis, {
    errorMap: () => ({ message: "Välj en avatar" }),
  }),
  nickName: z.string().min(1, "Ange ett smeknamn"),
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
      await addNewMemberToHousehold(
        householdId,
        {
          emoji: data.avatar,
          // Slå upp färgen från avatarColors-objektet baserat på vald emoji (Gippyhjälp)
          color: avatarColors[data.avatar as keyof typeof avatarColors],
        },
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
        {errors.householdName && <Text>{errors.householdName.message}</Text>}
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
        {errors.nickName && <Text>{errors.nickName.message}</Text>}
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <View>
              <Text style={s.title}>Välj din avatar:</Text>
              <AvatarPressablePicker onChange={onChange} value={value} />
            </View>
          )}
          name="avatar"
        />
        {errors.avatar && <Text>{errors.avatar.message}</Text>}
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
});
