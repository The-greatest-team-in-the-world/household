import { AvatarPressablePicker } from "@/components/avatar-pressable-picker";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { avatarColors } from "@/data/avatar-index";
import { Avatar } from "@/types/household-member";
import { Controller, UseFormReturn } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";

interface Props {
  control: UseFormReturn<any>["control"];
  onSubmit: () => void;
  filteredAvatars: Avatar[];
  errors: any;
  isSubmitting: boolean;
}

export default function JoinHouseholdForm({
  control,
  onSubmit,
  filteredAvatars,
  errors,
  isSubmitting,
}: Props) {
  const theme = useTheme();
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
      <CustomPaperButton
        text="Gå med!"
        disabled={isSubmitting}
        mode="contained"
        onPress={onSubmit}
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
