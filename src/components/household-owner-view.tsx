import { HouseholdMember } from "@/types/household-member";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { ActiveMemberCard } from "./active-member-card";
import { HouseholdInfoHeader } from "./household-info-header";
import { PendingMemberCard } from "./pending-member-card";

interface HouseholdOwnerViewProps {
  householdName: string;
  householdCode: string;
  pendingMembers: HouseholdMember[];
  activeMembers: HouseholdMember[];
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
  onMakeOwner: (userId: string) => void;
  onRemoveOwnership: (userId: string) => void;
}

export function HouseholdOwnerView({
  householdName,
  householdCode,
  pendingMembers,
  activeMembers,
  onApprove,
  onReject,
  onMakeOwner,
  onRemoveOwnership,
}: HouseholdOwnerViewProps) {
  return (
    <View style={styles.adminContainer}>
      <HouseholdInfoHeader
        householdName={householdName}
        householdCode={householdCode}
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
              onApprove={onApprove}
              onReject={onReject}
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
            onMakeOwner={onMakeOwner}
            onRemoveOwnership={onRemoveOwnership}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  adminContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "600",
  },
});
