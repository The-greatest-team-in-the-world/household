import { approveMember, rejectMember } from "@/api/members";
import { currentHouseholdAtom } from "@/atoms/household-atom";
import { initMembersListenerAtom, membersAtom } from "@/atoms/member-atom";
import { ActiveMemberCard } from "@/components/active-member-card";
import { MemberList } from "@/components/member-list";
import { PendingMemberCard } from "@/components/pending-member-card";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";

export default function HouseHoldDetailsScreen() {
  const currentHousehold = useAtomValue(currentHouseholdAtom);
  const members = useAtomValue(membersAtom);
  const initMembersListener = useSetAtom(initMembersListenerAtom);

  const [loading, setLoading] = useState(true);

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

  const handleApprove = async (userId: string) => {
    if (!currentHousehold?.id) return;

    try {
      await approveMember(currentHousehold.id, userId);
      // Members list will auto-update via listener
    } catch (error) {
      console.error("Error approving member:", error);
    }
  };

  const handleReject = async (userId: string) => {
    if (!currentHousehold?.id) return;

    try {
      await rejectMember(currentHousehold.id, userId);
      // Members list will auto-update via listener
    } catch (error) {
      console.error("Error rejecting member:", error);
    }
  };

  return (
    <Surface style={styles.container} elevation={0}>
      <ScrollView>
        {isOwner ? (
          <View style={styles.adminContainer}>
            <Text variant="headlineMedium" style={styles.heading}>
              Hushållsadministration
            </Text>

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
                <ActiveMemberCard key={member.userId} member={member} />
              ))}
            </View>
          </View>
        ) : (
          <MemberList
            members={members}
            householdName={currentHousehold.name}
            householdCode={currentHousehold.code}
          />
        )}
      </ScrollView>
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
});
