import { getHouseholdByCode } from "@/api/households";
import { addNewMemberToHousehold, getMembers } from "@/api/members";
import { AvatarPressablePicker } from "@/components/avatar-pressable-picker";
import { avatarColors } from "@/data/avatar-index";
import { useDebounce } from "@/hooks/useDebounce";
import { Household } from "@/types/household";
import { Avatar, HouseholdMember } from "@/types/household-member";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, Text, TextInput } from "react-native-paper";
import { z } from "zod";
import { avatarEmojis } from "./create-household";

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
  const [loading, setLoading] = useState(false);
  const [filteredAvatars, setFilteredAvatars] = useState<Avatar[]>([]);
  const [household, setHousehold] = useState<Household | null>(null);
  const [codeInput, setCodeInput] = useState("");

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
      // Gör en sökning på userid så att man inte inte kan lägga till sig flera gånger på ett och samma hushåll

      // Använd hushållet och sortera bort upptagna emojis
      if (result) {
        setFilteredAvatars(await filterAvatars(result));
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
      reset();
      console.log("Användare skapad!");
      router.replace("/(protected)");
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={s.scrollContent}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <View style={s.formContainer}>
        <Controller
          control={control}
          render={({ field: { onBlur, onChange, value } }) => (
            <View>
              <Text style={s.title}>Ange kod:</Text>
              <TextInput
                onBlur={onBlur}
                onChangeText={(value) => {
                  onChange(value); // Spara i formulärdata
                  setCodeInput(value); // Sätta för debouncing och sökning
                }}
                value={value || ""}
                autoCapitalize="characters"
                maxLength={8}
              />
            </View>
          )}
          name="code"
        />
        {errors.code && <Text style={s.errorText}>{errors.code.message}</Text>}

        {loading && <Text>Söker...</Text>}

        {!loading && household && (
          <>
            <View>
              <Text style={s.foundHousehold}>Hushåll hittat:</Text>
              <Text style={s.foundHousehold}>{household.name}</Text>
            </View>
          </>
        )}

        {!loading &&
          debouncedInput &&
          debouncedInput.length >= 6 &&
          !household && (
            <Text style={s.errorText}>
              Hittade inget hushåll med den koden!
            </Text>
          )}

        {household && (
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
    color: "red",
  },
  foundHousehold: {
    color: "green",
    fontWeight: 700,
    fontSize: 15,
  },
});

// En användare ska kunna gå med i ett hushåll genom att ange hushållets kod. *

// Kodfältet ska fyllas i och efter ett par sekunder ska ett anrop/förfrågan göras mot db och hushållet ska dyka upp under koden.
// Avatarlistan filtreras till att visa tillgänliga avatarer.
// Först då får man tillgång till gå med, avatar och namn fält.
// debouncing
