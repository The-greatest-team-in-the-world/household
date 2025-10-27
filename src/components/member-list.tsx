import { HouseholdMember } from "@/types/household-member";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Divider, Surface, Text, useTheme } from "react-native-paper";
import { HouseholdInfoHeader } from "./household-info-header";

interface MemberListProps {
  members: HouseholdMember[];
  householdName: string;
  householdCode: string;
  currentUserId?: string;
}

export function MemberList({
  members,
  householdName,
  householdCode,
  currentUserId,
}: MemberListProps) {
  const activeMembers = members.filter((m) => m.status === "active");
  const theme = useTheme();

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
          <View
            key={member.userId}
            style={[
              styles.memberRow,
              member.userId === currentUserId && {
                borderWidth: 2,
                borderColor: theme.colors.primary,
                borderRadius: 8,
                paddingHorizontal: 8,
              },
            ]}
          >
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
            <View style={styles.ownerBadge}>
              {member.isOwner && (
                <MaterialIcons name="star" size={20} color="#FFD700" />
              )}
            </View>
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
  ownerBadge: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
