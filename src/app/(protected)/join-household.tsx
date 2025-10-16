import { getHouseholdByCode } from "@/api/households";
import { AvatarPressablePicker } from "@/components/avatar-pressable-picker";
import { useDebounce } from "@/hooks/useDebounce";
import { Household } from "@/types/household";
import { zodResolver } from "@hookform/resolvers/zod";
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
    errorMap: () => ({ message: "Välj en avatar" }),
  }),
  nickName: z
    .string({ required_error: "Ange ett smeknamn" })
    .min(1, "Ditt smeknamn måste innehålla minst en bokstav"),
});

type FormFields = z.infer<typeof details>;
export default function JoinHouseholdScreen() {
  const [loading, setLoading] = useState(false);
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
    const fetchHousehold = async () => {
      // Är debounceinput tom eller har färre än 6 tecken gör ingenting
      if (!debouncedInput || debouncedInput.length < 6) {
        setHousehold(null);
        return;
      }
      // Annars sök efter hushåll efter delay, och om det finns retunera det
      setLoading(true);
      const result = await getHouseholdByCode(debouncedInput);
      console.log("result är:", result);
      setHousehold(result);
      setLoading(false);
    };

    fetchHousehold();
  }, [debouncedInput]);

  const onSubmit: SubmitHandler<FormFields> = () => {};

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={s.scrollContent}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <View>
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
          <Text style={s.foundHousehold}>
            Hushåll hittades: {household.name}
          </Text>
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
                  <AvatarPressablePicker onChange={onChange} value={value} />
                </View>
              )}
              name="avatar"
            />
            {errors.avatar && (
              <Text style={s.errorText}>{errors.avatar.message}</Text>
            )}
            <Button mode="contained" onPress={handleSubmit(onSubmit)}>
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
