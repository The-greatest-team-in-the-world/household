import { getHouseholdByCode } from "@/api/households";
import { addNewMemberToHousehold, getMembers } from "@/api/members";
import { userAtom } from "@/atoms/auth-atoms";
import AlertDialog from "@/components/alertDialog";
import { AvatarPressablePicker } from "@/components/avatar-pressable-picker";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { avatarColors, avatarEmojis } from "@/data/avatar-index";
import { useDebounce } from "@/hooks/useDebounce";
import { Household } from "@/types/household";
import { Avatar } from "@/types/household-member";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Surface, Text, TextInput, useTheme } from "react-native-paper";
import { z } from "zod";

const details = z.object({
  code: z
    .string({ required_error: "Ange en kod" })
    .min(6, "Ange en kod med 6 tecken"),
  avatar: z.enum(avatarEmojis, {
    errorMap: () => ({ message: "Välj en avatar" }),
  }),
  nickName: z
    .string({ required_error: "Ange ett smeknamn" })
    .min(1, "Ditt smeknamn måste innehålla minst 1 bokstav"),
});

type FormFields = z.infer<typeof details>;

export default function JoinHouseholdScreen() {
  const user = useAtomValue(userAtom);
  const [loading, setLoading] = useState(false);
  const [filteredAvatars, setFilteredAvatars] = useState<Avatar[]>([]);
  const [household, setHousehold] = useState<Household | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ resolver: zodResolver(details) });

  const debouncedInput = useDebounce(codeInput, 1000);

  useEffect(() => {
    const fetchHousehold = async () => {
      // Finns ingen, eller för kort, input så nollställs states. Endast sökfältet visas.
      if (!debouncedInput || debouncedInput.length < 6) {
        setLoading(false);
        setHousehold(null);
        setIsMember(false);
        setHasSearched(false);
        return;
      }
      // Annars så nollställs household och ismember och laddning startar för att hämta hushåll från db med angiven kod.
      setLoading(true);
      setHousehold(null);
      setIsMember(false);
      try {
        const result = await getHouseholdByCode(
          debouncedInput.toLocaleUpperCase(),
        );
        setHousehold(result);

        if (result) {
          // Hämta info om medlemmar i hushållet för att se om inloggad användare redan är medlem.
          // Filtrera bort upptagna avatarer
          const membersList = await getMembers(result.id);
          const avatars = membersList.map((a) => a.avatar.emoji);
          setFilteredAvatars(
            avatarColors.filter((a) => !avatars.includes(a.emoji)),
          );

          setIsMember(
            user != null && membersList.map((m) => m.userId).includes(user.uid),
          );
        }
        // Vänta med att rendera saker tills en sökning är klar. Detta för att förhindra att saker renderas vid fel tillfälle ⚡.
        setHasSearched(true);
      } catch (error) {
        console.error("Error fetching household:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHousehold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    // Kontrollera att household och household.id finns
    if (!household || !household.id) {
      return;
    }

    const selectedAvatar = avatarColors.find((a) => a.emoji === data.avatar);
    if (!selectedAvatar) {
      return;
    }

    try {
      // vad händer om två väljer kycklingen samtidigt?

      await addNewMemberToHousehold(
        household.id,
        selectedAvatar,
        data.nickName,
        false,
        false,
        "pending",
      );

      setDialogOpen(true);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const isAlreadyMember =
    !loading && hasSearched && household != null && isMember;

  const isHouseholdFound = !loading && hasSearched && household != null;

  const isNotMemberInFoundHousehold =
    !loading && hasSearched && household != null && !isMember;

  const isHouseholdNotFound = !loading && hasSearched && household == null;

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={s.scrollContent}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={80}
    >
      <View style={s.formContainer}>
        <Controller
          control={control}
          render={({ field: { onBlur, onChange, value } }) => (
            <View style={s.inputField}>
              <Surface style={s.surface}>
                <Text style={s.surfaceTitle}>
                  Anslut till ett nytt hushåll 🏡
                </Text>
                <Text style={s.surfaceText}>
                  För att ansluta behöver du en 6-siffrig kod!
                </Text>
                <Text style={s.surfaceText}>
                  Koden får du från en medlem i det hushåll du vill ansluta
                  till.
                </Text>
              </Surface>
              <TextInput
                mode="outlined"
                theme={{ roundness: 8 }}
                onBlur={onBlur}
                onChangeText={(value) => {
                  onChange(value); // Spara i formulärdata
                  setCodeInput(value); // Sätta för debouncing och sökning
                }}
                value={value || ""}
                label="Ange hushållskod"
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>
          )}
          name="code"
        />
        {errors.code && (
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            {errors.code.message}
          </Text>
        )}

        {loading && (
          <View>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        {isAlreadyMember && (
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            Du är redan medlem i detta hushåll!
          </Text>
        )}

        {isHouseholdFound && (
          <>
            <View>
              <Text
                style={[s.foundHousehold, { color: theme.colors.onBackground }]}
              >
                Hushåll hittat: {household.name}
              </Text>
            </View>
          </>
        )}

        {isHouseholdNotFound && (
          <View>
            <Text style={[s.errorText, { color: theme.colors.error }]}>
              Hushållet kunde inte hittas.
            </Text>
            <Text style={[s.errorText, { color: theme.colors.error }]}>
              Har du skrivit in rätt kod?
            </Text>
          </View>
        )}

        {isNotMemberInFoundHousehold && (
          <View style={s.inputField}>
            <Controller
              control={control}
              render={({ field: { onBlur, onChange, value } }) => (
                <View style={s.inputField}>
                  <TextInput
                    mode="outlined"
                    theme={{ roundness: 8 }}
                    label="Smeknamn"
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
              onPress={handleSubmit(onSubmit)}
            />
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
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

const s = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  blurContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputField: {
    gap: 20,
  },
  title: {
    paddingTop: 15,
    paddingBottom: 10,
    fontWeight: 700,
    fontSize: 15,
  },
  errorText: {
    fontSize: 17,
    fontWeight: 700,
  },
  foundHousehold: {
    fontWeight: 700,
    fontSize: 15,
    gap: 10,
  },
  surface: {
    elevation: 4,
    borderRadius: 20,
    padding: 30,
  },
  surfaceTitle: {
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: 700,
    fontSize: 20,
  },
  surfaceText: {
    fontSize: 16,
    fontWeight: 600,
    padding: 5,
  },
});
