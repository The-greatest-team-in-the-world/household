import { Household } from "@/types/household";
import { HouseholdMember } from "@/types/household-member";
import { StyleSheet, View } from "react-native";
import { MD3Theme, Text, useTheme } from "react-native-paper";
import JoinHouseholdForm from "./join-houshold-form";
import ReactivateUser from "./reactivate-user";

export type HouseholdStatus = "unknown" | "full";
export type MemberStatus =
  | "unknown"
  | "pending"
  | "retired"
  | "member"
  | "not-member";

interface Props {
  householdStatus: HouseholdStatus;
  memberStatus: MemberStatus;
  household: Household | null;
  householdMembers: HouseholdMember[];
}

function HouseHoldDetails(
  theme: MD3Theme,
  householdStatus: HouseholdStatus,
  household: Household | null,
) {
  if (!household) {
    return (
      <View style={s.padding}>
        <Text style={[s.errorText, { color: theme.colors.error }]}>
          Hushållet kunde inte hittas.
        </Text>
        <Text style={s.infoMessage}>Har du skrivit in rätt kod?</Text>
      </View>
    );
  }

  return (
    <>
      <View style={s.padding}>
        <Text style={[s.foundHousehold, { color: theme.colors.tertiary }]}>
          Hushåll hittat: {household.name}
        </Text>
      </View>
      {householdStatus === "full" && (
        <View>
          <Text style={[s.infoMessage, { color: theme.colors.tertiary }]}>
            Detta husåhåll är för närvarande fullt. Du kan därför inte ansluta.
          </Text>
        </View>
      )}
    </>
  );
}

function MemberDetails(
  theme: MD3Theme,
  householdStatus: HouseholdStatus,
  memberStatus: MemberStatus,
  householdMembers: HouseholdMember[],
  household: Household | null,
) {
  // Om inget hushåll finns eller om hushållet är fullt ska inget i switchen visas.
  if (!household || householdStatus === "full") return null;

  switch (memberStatus) {
    case "member":
      return (
        <Text style={[s.errorText, s.padding, { color: theme.colors.error }]}>
          Du är redan medlem i detta hushåll.
        </Text>
      );
    case "pending":
      return (
        <View>
          <Text style={[s.infoMessage, { color: theme.colors.tertiary }]}>
            Du har redan ansökt om medlemlemskap i detta hushåll. Inväntar
            godkännande!
          </Text>
        </View>
      );
    case "retired":
      return (
        <ReactivateUser
          household={household}
          householdMembers={householdMembers}
        />
      );
    case "not-member":
      return (
        <View>
          <JoinHouseholdForm
            household={household}
            householdMembers={householdMembers}
          />
        </View>
      );
  }
}

export default function ShowHouseholdDetails({
  householdStatus,
  memberStatus,
  household,
  householdMembers,
}: Props) {
  const theme = useTheme();
  return (
    <>
      {HouseHoldDetails(theme, householdStatus, household)}
      {MemberDetails(
        theme,
        householdStatus,
        memberStatus,
        householdMembers,
        household,
      )}
    </>
  );
}

const s = StyleSheet.create({
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
});
