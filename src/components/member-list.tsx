import { HouseholdMember } from "@/types/household-member";
import { StyleSheet, View } from "react-native";
import { Divider, IconButton, Surface, Text } from "react-native-paper";
import { HouseholdInfoHeader } from "./household-info-header";

interface MemberListProps {
  members: HouseholdMember[];
  householdName: string;
  householdCode: string;
  isOwner: boolean;
}

export function MemberList({
  members,
  householdName,
  householdCode,
  isOwner,
}: MemberListProps) {
  // Visa alla aktiva medlemmar, även de som är pausade
  const activeMembers = members.filter((m) => m.status === "active");

  const handleTogglePause = (member: HouseholdMember) => {
    // TODO: Implementera pause/unpause logik
    console.log(
      "Toggle pause for:",
      member.nickName,
      "isPaused:",
      member.isPaused,
    );
  };

  return (
    <>
      <HouseholdInfoHeader
        householdName={householdName}
        householdCode={householdCode}
      />

      <Surface style={styles.card} elevation={1}>
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
                member.isPaused && styles.paused,
              ]}
            >
              <Text
                style={[styles.avatarEmoji, member.isPaused && styles.paused]}
              >
                {member.avatar.emoji}
              </Text>
            </View>
            <View style={[styles.memberText, member.isPaused && styles.paused]}>
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
            {isOwner && (
              <IconButton
                icon={member.isPaused ? "play" : "pause"}
                size={24}
                onPress={() => handleTogglePause(member)}
              />
            )}
          </View>
        ))}
      </Surface>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
  paused: {
    opacity: 0.5,
  },
});
