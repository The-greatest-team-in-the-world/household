import { toggleMemberPause } from "@/api/members";
import { userAtom } from "@/atoms/auth-atoms";
import { currentHouseholdAtom } from "@/atoms/household-atom";
import { initMembersListenerAtom, membersAtom } from "@/atoms/member-atom";
import { ActiveMemberCard } from "@/components/active-member-card";
import AlertDialog from "@/components/alertDialog";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { HouseholdInfoHeader } from "@/components/household-info-header";
import { MemberList } from "@/components/member-list";
import { PendingMemberCard } from "@/components/pending-member-card";
import { useMemberManagement } from "@/hooks/useMemberManagement";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";

export default function HouseHoldDetailsScreen() {
  const currentHousehold = useAtomValue(currentHouseholdAtom);
  const members = useAtomValue(membersAtom);
  const user = useAtomValue(userAtom);
  const initMembersListener = useSetAtom(initMembersListenerAtom);

  const [loading, setLoading] = useState(true);

  const {
    handleApprove,
    handleReject,
    handleMakeOwner,
    handleRemoveOwnership,
    makeOwnerDialog,
    setMakeOwnerDialog,
    confirmMakeOwner,
    removeOwnerDialog,
    setRemoveOwnerDialog,
    confirmRemoveOwnership,
    errorDialog,
    setErrorDialog,
    handleLeaveHousehold,
    leaveHouseholdDialog,
    setLeaveHouseholdDialog,
    confirmLeaveHousehold,
    deleteHouseholdDialog,
    setDeleteHouseholdDialog,
    confirmDeleteHousehold,
  } = useMemberManagement(
    currentHousehold?.id,
    members,
    currentHousehold?.ownerIds,
  );

  useEffect(() => {
    if (!currentHousehold?.id) return;

    setLoading(true);
    // Set up real-time listener for members
    const unsubscribe = initMembersListener(currentHousehold.id);
    setLoading(false);

    // Cleanup listener when component unmounts or household changes
    return () => {
      unsubscribe();
    };
  }, [currentHousehold?.id, initMembersListener]);

  if (!currentHousehold) {
    return (
      <Surface style={styles.centerContainer} elevation={0}>
        <Text>No household selected</Text>
      </Surface>
    );
  }

  if (loading) {
    return (
      <Surface style={styles.centerContainer} elevation={0}>
        <ActivityIndicator size="large" />
      </Surface>
    );
  }

  // Check isOwner from currentHousehold (which includes isOwner from getUsersHouseholds)
  const isOwner = currentHousehold?.isOwner ?? false;

  const pendingMembers = members.filter((m) => m.status === "pending");
  const activeMembers = members.filter((m) => m.status === "active");

  const handleTogglePause = async (userId: string) => {
    if (!currentHousehold?.id) return;

    try {
      const result = await toggleMemberPause(currentHousehold.id, userId);
      if (!result.success) {
        Alert.alert("Fel", result.error || "Kunde inte pausa/aktivera medlem");
      }
    } catch (error) {
      console.error("Error toggling pause:", error);
      Alert.alert("Fel", "Ett oväntat fel uppstod");
    }
  };

  return (
    <Surface style={styles.container} elevation={0}>
      <ScrollView>
        {isOwner ? (
          <View style={styles.adminContainer}>
            <HouseholdInfoHeader
              householdName={currentHousehold.name}
              householdCode={currentHousehold.code}
            />

            {/* Pending members section */}
            {pendingMembers.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Förfrågningar ({pendingMembers.length})
                </Text>
                {pendingMembers.map((member) => (
                  <PendingMemberCard
                    key={member.userId}
                    member={member}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </View>
            )}

            {/* Active members section */}
            <View style={styles.section}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Aktiva medlemmar ({activeMembers.length})
              </Text>
              {activeMembers.map((member) => (
                <ActiveMemberCard
                  key={member.userId}
                  member={member}
                  onMakeOwner={handleMakeOwner}
                  onRemoveOwnership={handleRemoveOwnership}
                  onTogglePause={handleTogglePause}
                  currentUserId={user?.uid}
                />
              ))}
            </View>
          </View>
        ) : (
          <MemberList
            members={members}
            householdName={currentHousehold.name}
            householdCode={currentHousehold.code}
            householdId={currentHousehold.id}
            currentUserId={user?.uid}
            isOwner={currentHousehold.isOwner}
          />
        )}
      </ScrollView>

      {/* Leave Household Button */}
      <View style={styles.buttonContainer}>
        <CustomPaperButton
          mode="outlined"
          icon="exit-to-app"
          text="Lämna hushåll"
          onPress={handleLeaveHousehold}
        />
      </View>

      <AlertDialog
        open={makeOwnerDialog.open}
        onClose={() =>
          setMakeOwnerDialog({ open: false, userId: "", nickName: "" })
        }
        headLine="Gör till ägare"
        alertMsg={`Är du säker på att du vill göra ${makeOwnerDialog.nickName} till en ägare av hushållet? Ägare kan godkänna nya medlemmar och hantera andra medlemmar.`}
        agreeText="Ja, gör till ägare"
        disagreeText="Avbryt"
        agreeAction={confirmMakeOwner}
      />

      <AlertDialog
        open={removeOwnerDialog.open}
        onClose={() =>
          setRemoveOwnerDialog({ open: false, userId: "", nickName: "" })
        }
        headLine="Ta bort ägarskap"
        alertMsg={`Är du säker på att du vill ta bort ${removeOwnerDialog.nickName} som ägare? De kommer fortfarande vara medlem i hushållet men kan inte längre godkänna nya medlemmar eller hantera andra.`}
        agreeText="Ja, ta bort ägarskap"
        disagreeText="Avbryt"
        agreeAction={confirmRemoveOwnership}
      />

      <AlertDialog
        open={leaveHouseholdDialog}
        onClose={() => setLeaveHouseholdDialog(false)}
        headLine="Lämna hushåll"
        alertMsg={`Är du säker på att du vill lämna hushållet "${currentHousehold?.name}"? Du kommer inte längre ha tillgång till hushållets sysslor och information.`}
        agreeText="Ja, lämna hushåll"
        disagreeText="Avbryt"
        agreeAction={confirmLeaveHousehold}
      />

      <AlertDialog
        open={deleteHouseholdDialog}
        onClose={() => setDeleteHouseholdDialog(false)}
        headLine="Radera hushåll"
        alertMsg={`Du är den enda medlemmen i hushållet "${currentHousehold?.name}". Om du lämnar kommer hushållet att raderas permanent inklusive alla sysslor och historik. Är du säker?`}
        agreeText="Ja, radera hushåll"
        disagreeText="Avbryt"
        agreeAction={confirmDeleteHousehold}
      />

      <AlertDialog
        open={errorDialog.open}
        onClose={() => setErrorDialog({ open: false, message: "" })}
        headLine="Åtgärden kunde inte utföras"
        alertMsg={errorDialog.message}
        agreeText="OK"
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  adminContainer: {
    padding: 16,
  },
  heading: {
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "600",
  },
  buttonContainer: {
    padding: 16,
    gap: 16,
  },
});
