import { createNewHousehold } from "@/api/households";
import { addNewMemberToHousehold } from "@/api/members";
import { AvatarPressablePicker } from "@/components/avatar-pressable-picker";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { avatarColors, avatarEmojis } from "@/data/avatar-index";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Surface, Text, TextInput, useTheme } from "react-native-paper";
import { z } from "zod";

const newHouseHold = z.object({
  householdName: z
    .string({ required_error: "Namnge hushållet" })
    .min(1, "Namnet måste vara minst 1 tecken"),
  avatar: z.enum(avatarEmojis, {
    errorMap: () => ({ message: "Välj en avatar" }),
  }),
  nickName: z
    .string({ required_error: "Ange ett smeknamn" })
    .min(1, "Ditt smeknamn måste vara minst 1 tecken"),
});

type FormFields = z.infer<typeof newHouseHold>;

export default function CreateHousholdScreen() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(newHouseHold),
    defaultValues: {},
  });
  const theme = useTheme();

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const householdId = await createNewHousehold(data.householdName);
      // Hitta avatar-objektet som matchar vald emoji
      const selectedAvatar = avatarColors.find((a) => a.emoji === data.avatar);
      if (!selectedAvatar) {
        return;
      }

      const result = await addNewMemberToHousehold(
        householdId,
        selectedAvatar,
        data.nickName,
        false, // isPaused
        true, // IsOwner
        "active", // Status
      );
      if (result.success) {
        setErrorMessage(null);
        router.replace("/(protected)");
      } else {
        setErrorMessage(result.error || "Uppdateringen misslyckades.");
      }
    } catch (error) {
      console.error("Error creating household:", error);
      console.error(errorMessage);
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
          <Text style={s.surfaceTitle}>Vad funkar bäst? Teamwork! 🏡</Text>
          <Text style={s.surfaceSubText}>
            Bjud in familj eller vänner, dela sysslorna och håll koll på vem som
            gör vad.
          </Text>
        </Surface>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                mode="outlined"
                theme={{ roundness: 8 }}
                label="Hushållets namn"
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
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            {errors.householdName.message}
          </Text>
        )}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                label="Ditt smeknamn"
                mode="outlined"
                theme={{ roundness: 8 }}
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
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            {errors.nickName.message}
          </Text>
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
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            {errors.avatar.message}
          </Text>
        )}
        <CustomPaperButton
          text="Skapa"
          mode="contained"
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
      {errorMessage && (
        <Text style={[s.errorText, { color: theme.colors.error }]}>
          {errorMessage}
        </Text>
      )}
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
    fontWeight: 600,
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
