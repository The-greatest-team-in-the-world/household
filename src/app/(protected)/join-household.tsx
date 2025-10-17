import { getHouseholdByCode } from "@/api/households";
import { addNewMemberToHousehold, getMembers } from "@/api/members";
import { userAtom } from "@/atoms/auth-atoms";
import { AvatarPressablePicker } from "@/components/avatar-pressable-picker";
import { avatarColors, avatarEmojis } from "@/data/avatar-index";
import { useDebounce } from "@/hooks/useDebounce";
import { Household } from "@/types/household";
import { Avatar } from "@/types/household-member";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, Surface, Text, TextInput } from "react-native-paper";
import { z } from "zod";

const details = z.object({
  code: z
    .string({ required_error: "Ange en kod" })
    .min(6, "Ange en kod men minst 6 tecken"),
  avatar: z.enum(avatarEmojis, {
    errorMap: () => ({ message: "Välj en avatar!" }),
  }),
  nickName: z
    .string({ required_error: "Ange ett smeknamn!" })
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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ resolver: zodResolver(details) });

  const debouncedInput = useDebounce(codeInput, 1000);

  useEffect(() => {
    async function filterAvatars(household: Household) {
      const members = await getMembers(household.id);
      const avatars = members.map((a) => a.avatar.emoji);

      // Filter retunerar de avatarer där predicatet blir true, dvs de som inte finns i familjen
      // De som finns i familjen kommer att retunera false
      return avatarColors.filter((a) => !avatars.includes(a.emoji));
    }

    const fetchHousehold = async () => {
      // Är debounce-input tom eller har färre än 6 tecken sätt till null
      if (!debouncedInput || debouncedInput.length < 6) {
        setHousehold(null);
        return;
      }
      // Annars sök efter hushåll efter delay, och om det finns retunera det.
      setLoading(true);
      const result = await getHouseholdByCode(debouncedInput);
      setHousehold(result);

      // Använd hushållet och sortera bort upptagna emojis
      if (result) {
        setFilteredAvatars(await filterAvatars(result));
        // Hämta info om medlemmar i hushållet för att se om inloggad användare redan är medlem.
        const membersList = await getMembers(result.id);
        console.log("lista med medlemmar:", membersList);
        setIsMember(
          user != null && membersList.map((m) => m.userId).includes(user.uid),
        );
        console.log(
          "JOINA HUSHÅLL --> Fanns medlem i hushållet?:",
          isMember,
          result?.name,
        );
      }
      setLoading(false);
    };

    fetchHousehold();
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
      await addNewMemberToHousehold(
        household.id,
        selectedAvatar,
        data.nickName,
        false,
        false,
        "pending",
      );
      Alert.alert(
        "Klart!",
        `Din förfrågan till ${household.name} har skickats. Hushållet visas under "Mina hushåll" när du blivit godkänd.`,
      );

      console.log("Användare skapad!");
      router.replace("/(protected)");
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const isAlreadyMember = !loading && household && isMember;
  const isHouseholdFound =
    debouncedInput.length >= 6 && !loading && debouncedInput && household;

  const isNotMemberInFoundHousehold = !loading && household && !isMember;
  const IsHouseholdNotFound =
    debouncedInput.length >= 6 && !loading && debouncedInput && !household;
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
            <View>
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

              <Text style={s.title}>Skriv in koden:</Text>
              <TextInput
                onBlur={onBlur}
                onChangeText={(value) => {
                  onChange(value); // Spara i formulärdata
                  setCodeInput(value); // Sätta för debouncing och sökning
                }}
                value={value || ""}
                placeholder="Skriv in din hushållskod här..."
                autoCapitalize="characters"
                maxLength={8}
              />
            </View>
          )}
          name="code"
        />
        {errors.code && <Text style={s.errorText}>{errors.code.message}</Text>}

        {loading && (
          <View>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        {isAlreadyMember && (
          <Text style={s.errorText}>Du är redan medlem i detta hushåll!</Text>
        )}
        {isHouseholdFound && (
          <>
            <View>
              <Text style={s.foundHousehold}>Hushåll hittat:</Text>
              <Text style={s.foundHousehold}>{household.name}</Text>
            </View>
          </>
        )}

        {IsHouseholdNotFound && (
          <View>
            <Text style={s.errorText}>Hushållet kunde inte hittas.</Text>
            <Text style={s.errorText}>Har du skrivit in rätt kod?</Text>
          </View>
        )}

        {isNotMemberInFoundHousehold && (
          <View>
            <Controller
              control={control}
              render={({ field: { onBlur, onChange, value } }) => (
                <View>
                  <Text style={s.title}>Välj smeknamn:</Text>
                  <TextInput
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
              <Text style={s.errorText}>{errors.avatar.message}</Text>
            )}
            <Button
              disabled={isSubmitting}
              mode="contained"
              onPress={handleSubmit(onSubmit)}
            >
              Gå med!
            </Button>
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
  formContainer: {
    padding: 20,
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
    color: "red",
  },
  foundHousehold: {
    color: "green",
    fontWeight: 700,
    fontSize: 15,
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
