import { toggleMemberPause } from "@/api/members";
import { HouseholdMember } from "@/types/household-member";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import {
  Divider,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { HouseholdInfoHeader } from "./household-info-header";

interface MemberListProps {
  members: HouseholdMember[];
  householdName: string;
  householdCode: string;
  householdId: string;
  currentUserId?: string;
  isOwner: boolean;
}

export function MemberList({
  members,
  householdName,
  householdCode,
  householdId,
  currentUserId,
  isOwner,
}: MemberListProps) {
  // Visa alla aktiva medlemmar, även de som är pausade
  const activeMembers = members.filter((m) => m.status === "active");
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleTogglePause = async (member: HouseholdMember) => {
    setLoading(true);
    try {
      const result = await toggleMemberPause(householdId, member.userId);
      if (!result.success) {
        Alert.alert("Fel", result.error || "Kunde inte pausa/aktivera medlem");
      }
    } catch (error) {
      console.error("Error toggling pause:", error);
      Alert.alert("Fel", "Ett oväntat fel uppstod");
    } finally {
      setLoading(false);
    }
  };

  console.log("MemberList - isOwner:", isOwner);

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
            <View style={styles.ownerBadge}>
              {member.isOwner && (
                <MaterialIcons name="star" size={20} color="#FFD700" />
              )}
            </View>
            {isOwner && (
              <IconButton
                icon={member.isPaused ? "play" : "pause"}
                size={24}
                onPress={() => handleTogglePause(member)}
                disabled={loading}
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
  ownerBadge: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  paused: {
    opacity: 0.5,
  },
});
