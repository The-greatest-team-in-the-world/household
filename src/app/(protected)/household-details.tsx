import { getMembers } from "@/api/members";
import { currentHouseholdAtom } from "@/atoms/household-atom";
import { membersAtom } from "@/atoms/member-atom";
import { MemberList } from "@/components/member-list";
import { PendingMemberCard } from "@/components/pending-member-card";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export default function HouseHoldDetailsScreen() {
  const currentHousehold = useAtomValue(currentHouseholdAtom);
  const setMembers = useSetAtom(membersAtom);
  const members = useAtomValue(membersAtom);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      if (!currentHousehold?.id) return;

      setLoading(true);
      try {
        const fetchedMembers = await getMembers(currentHousehold.id);
        setMembers(fetchedMembers);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [currentHousehold?.id, setMembers]);

  if (!currentHousehold) {
    return (
      <View style={styles.centerContainer}>
        <Text>No household selected</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Check isOwner from currentHousehold (which includes isOwner from getUsersHouseholds)
  const isOwner = currentHousehold?.isOwner ?? false;

  // Filter members depending on status
  const pendingMembers = members.filter((m) => m.status === "pending");
  const activeMembers = members.filter((m) => m.status === "active");

  // Handler functions for approving/rejecting members
  const handleApprove = (userId: string) => {
    console.log("Approve member:", userId);
    // TODO: Call API to approve member
  };

  const handleReject = (userId: string) => {
    console.log("Reject member:", userId);
    // TODO: Call API to delete member
  };

  return (
    <ScrollView style={styles.container}>
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
            <Text variant="bodyMedium">
              Lista över aktiva medlemmar kommer här...
            </Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
