import useUserStatus from "@/hooks/useUserStatus";
import { Household } from "@/types/household";
import { HouseholdMember } from "@/types/household-member";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import AlertDialog from "../alertDialog";
import { CustomPaperButton } from "../custom-paper-button";

interface Props {
  household: Household;
  retiredUser: HouseholdMember;
}

export default function ReactivateUser({ household, retiredUser }: Props) {
  const theme = useTheme();
  const {
    isLoading,
    isDialogOpen,
    errorMessage,
    setIsDialogOpen,
    updateUserStatus,
  } = useUserStatus();
  return (
    <View style={s.gap}>
      <View style={s.gap}>
        <Text style={[s.infoMessage, { color: theme.colors.tertiary }]}>
          Du har varit medlem i detta hushåll tidigare. Vill du ansöka om att
          återaktivera ditt medlemsskap?
        </Text>
      </View>
      <CustomPaperButton
        mode="contained"
        text="Ansök igen"
        disabled={isLoading}
        onPress={() =>
          updateUserStatus("pending", household.id, retiredUser.userId)
        }
      />
      <CustomPaperButton
        mode="outlined"
        text="Avbryt"
        onPress={() => router.dismissTo("/(protected)")}
      />
      {errorMessage && (
        <Text style={[s.errorText, { color: theme.colors.error }]}>
          {errorMessage}
        </Text>
      )}
      <AlertDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        headLine="Förfrågan skickad!"
        alertMsg={`Din förfrågan till ${household.name} har skickats. Hushållet visas under "Mina hushåll" när du blivit godkänd.\n\nDitt smeknamn är "${retiredUser.nickName}" och du har avataren ${retiredUser.avatar.emoji}`}
        agreeText="OK"
        agreeAction={() => {
          setIsDialogOpen(false);
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
  errorText: {
    fontSize: 15,
    fontWeight: 600,
  },
  infoMessage: {
    fontSize: 15,
  },
});
