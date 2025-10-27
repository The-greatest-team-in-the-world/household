import { addNewMemberToHousehold } from "@/api/members";
import { AvatarPressablePicker } from "@/components/avatar-pressable-picker";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { avatarColors, avatarEmojis } from "@/data/avatar-index";
import { Household } from "@/types/household";
import { HouseholdMember } from "@/types/household-member";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import { z } from "zod";
import AlertDialog from "../alertDialog";

interface Props {
  household: Household;
  householdMembers: HouseholdMember[];
}

const details = z.object({
  avatar: z.enum(avatarEmojis, {
    errorMap: () => ({ message: "Välj en avatar" }),
  }),
  nickName: z
    .string({ required_error: "Ange ett smeknamn" })
    .min(1, "Ditt smeknamn måste innehålla minst 1 bokstav"),
});

type FormFields = z.infer<typeof details>;
export default function JoinHouseholdForm({
  household,
  householdMembers,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const theme = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ resolver: zodResolver(details) });

  const avatars = householdMembers.map((a) => a.avatar.emoji);
  const filteredAvatars = avatarColors.filter(
    (a) => !avatars.includes(a.emoji),
  );

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (!household || !household.id) {
      return;
    }

    const selectedAvatar = avatarColors.find((a) => a.emoji === data.avatar);
    if (!selectedAvatar) {
      return;
    }

    try {
      // vad händer om två väljer kycklingen samtidigt?
      const result = await addNewMemberToHousehold(
        household.id,
        selectedAvatar,
        data.nickName,
        false,
        false,
        "pending",
      );

      if (result.success) {
        setErrorMessage(null);
        setDialogOpen(true);
      } else {
        setErrorMessage(result.error || "Uppdateringen misslyckades.");
      }
    } catch (error) {
      console.error("Error adding member to household:", error);
      console.error(errorMessage);
    }
  };

  return (
    <View style={s.gap}>
      <Controller
        control={control}
        render={({ field: { onBlur, onChange, value } }) => (
          <View style={s.gap}>
            <TextInput
              mode="outlined"
              theme={{ roundness: 8 }}
              label="Ditt smeknamn"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="words"
              keyboardType="default"
              autoCorrect={false}
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
            <Text style={s.title}>Välj din avatar: </Text>
            <AvatarPressablePicker
              onChange={(avatar) => onChange(avatar.emoji)}
              value={avatarColors.find((a) => a.emoji === value)}
              avatars={filteredAvatars}
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
      <View>
        <CustomPaperButton
          text="Gå med!"
          disabled={isSubmitting}
          mode="contained"
          onPress={handleSubmit(onSubmit)}
        />
      </View>
      {errorMessage && (
        <Text style={[s.errorText, { color: theme.colors.error }]}>
          {errorMessage}
        </Text>
      )}
      <AlertDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        headLine="Förfrågan skickad!"
        alertMsg={`Din förfrågan till ${household.name} har skickats. Hushållet visas under "Mina hushåll" när du blivit godkänd.`}
        agreeText="OK"
        agreeAction={() => {
          setDialogOpen(false);
          router.dismissTo("/(protected)");
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  gap: {
    gap: 20,
  },
  title: {
    paddingTop: 15,
    paddingBottom: 10,
    fontWeight: 700,
    fontSize: 15,
  },
  errorText: {
    fontSize: 15,
    fontWeight: 600,
  },
});
