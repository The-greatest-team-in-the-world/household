import { getHouseholdByCode } from "@/api/households";
import { getMembers } from "@/api/members";
import { userAtom } from "@/atoms/auth-atoms";
import ShowHouseholdDetails, {
  HouseholdStatus,
  MemberStatus,
} from "@/components/join-household/household-details";
import { avatarEmojis } from "@/data/avatar-index";
import { useDebounce } from "@/hooks/useDebounce";
import { Household } from "@/types/household";
import { HouseholdMember } from "@/types/household-member";
import { User } from "@firebase/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Surface, Text, TextInput, useTheme } from "react-native-paper";
import { z } from "zod";

const details = z.object({
  code: z
    .string({ required_error: "Ange en kod" })
    .min(6, "Ange en kod med 6 tecken"),
});

type FormFields = z.infer<typeof details>;

export default function JoinHouseholdScreen() {
  const user = useAtomValue(userAtom);
  const [loading, setLoading] = useState(false);
  const [household, setHousehold] = useState<Household | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [householdStatus, setHouseholdStatus] =
    useState<HouseholdStatus>("unknown");
  const [memberStatus, setMemberStatus] = useState<MemberStatus>("unknown");
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>(
    [],
  );
  const theme = useTheme();
  const {
    control,
    watch,
    formState: { errors },
  } = useForm<FormFields>({ resolver: zodResolver(details), mode: "onChange" });

  const codeValue = watch("code");
  const debouncedInput = useDebounce(codeValue, 1000);

  useEffect(() => {
    const fetchHousehold = async (user: User) => {
      // Finns ingen, eller för kort, input så nollställs states. Endast sökfältet visas.
      if (!debouncedInput || debouncedInput.length < 6) {
        setLoading(false);
        setHousehold(null);
        setHasSearched(false);
        return;
      }
      // Annars så nollställs household och laddning startar för att hämta hushåll från db med angiven kod.
      setLoading(true);
      setHousehold(null);
      try {
        const result = await getHouseholdByCode(
          debouncedInput.toLocaleUpperCase(),
        );
        setHousehold(result);

        if (result) {
          // Hämta info om medlemmar i hushållet.
          const membersList = await getMembers(result.id);

          setHouseholdMembers(membersList);
          // Kontrollera om hushållet är fullt.
          if (membersList.length === avatarEmojis.length) {
            setHouseholdStatus("full");
          }
          // Kontrollera om användaren är medlem i hushållet.
          const currentMember = membersList.find((m) => m.userId === user.uid);
          if (currentMember) {
            setMemberStatus(
              currentMember.status === "pending"
                ? "pending"
                : currentMember.status === "left"
                ? "retired"
                : "member",
            );
          } else {
            setMemberStatus("not-member");
          }
        }
        // Vänta med att rendera saker tills en sökning är klar. Detta för att förhindra att saker renderas vid fel tillfälle ⚡.
        setHasSearched(true);
      } catch (error) {
        console.error("Error fetching household:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHousehold(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

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
            <View style={s.gap}>
              <Surface style={s.surface}>
                <Text style={s.surfaceTitle}>
                  Anslut till ett nytt hushåll 🏡
                </Text>
                <Text style={s.surfaceText}>
                  För att ansluta behöver du en 6-siffrig kod! Koden får du från
                  en medlem i det hushåll du vill ansluta till.
                </Text>
              </Surface>
              <TextInput
                mode="outlined"
                theme={{ roundness: 8 }}
                onBlur={onBlur}
                onChangeText={(value) => {
                  onChange(value);
                }}
                value={value || ""}
                label="Ange hushållskod"
                autoCapitalize="characters"
                maxLength={6}
                keyboardType="default"
                autoCorrect={false}
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

        {loading ? (
          <View>
            <ActivityIndicator size="large" color={theme.colors.onBackground} />
          </View>
        ) : (
          hasSearched && (
            <ShowHouseholdDetails
              householdStatus={householdStatus}
              memberStatus={memberStatus}
              household={household}
              householdMembers={householdMembers}
            />
          )
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
    flex: 1,
  },
  gap: {
    gap: 20,
  },
  padding: {
    paddingTop: 5,
    paddingBottom: 5,
  },
  infoMessage: {
    fontSize: 15,
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
  },
});
