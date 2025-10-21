import { HouseholdMember } from "@/types/household-member";
import { StyleSheet, View } from "react-native";
import { Card, Divider, Text } from "react-native-paper";

interface MemberListProps {
  members: HouseholdMember[];
  householdName: string;
  householdCode: string;
}

export function MemberList({
  members,
  householdName,
  householdCode,
}: MemberListProps) {
  // Show all members with status 'active' (includes both paused and non-paused)
  const activeMembers = members.filter((m) => m.status === "active");

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="headlineMedium" style={styles.householdName}>
          {householdName}
        </Text>
        <Text variant="bodyMedium" style={styles.code}>
          [{householdCode}]
        </Text>

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Medlemmar:
        </Text>
        {activeMembers.map((member) => (
          <View key={member.userId} style={styles.memberRow}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: member.avatar.color },
              ]}
            >
              <Text style={styles.avatarEmoji}>{member.avatar.emoji}</Text>
            </View>
            <View style={styles.memberText}>
              <Text variant="bodyLarge">{member.nickName}</Text>
              <Text
                variant="bodySmall"
                style={[
                  styles.statusText,
                  member.isPaused && styles.pausedText,
                ]}
              >
                {member.isPaused ? "Pausad" : "Aktiv"}
              </Text>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    backgroundColor: "white",
  },
  householdName: {
    textAlign: "center",
    marginBottom: 4,
  },
  code: {
    textAlign: "center",
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "bold",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  memberText: {
    flex: 1,
  },
  statusText: {
    color: "#666",
    fontStyle: "italic",
  },
  pausedText: {
    color: "#ff9800",
    fontWeight: "500",
  },
});
