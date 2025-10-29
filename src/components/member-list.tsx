import { toggleMemberPause } from "@/api/members";
import { HouseholdMember } from "@/types/household-member";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { IconButton, Surface, Text, useTheme } from "react-native-paper";
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
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<HouseholdMember | null>(
    null,
  );

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

      <View style={styles.container}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Medlemmar:
        </Text>

        {activeMembers.map((member) => (
          <Surface
            key={member.userId}
            style={[
              styles.card,
              member.userId === currentUserId && {
                borderWidth: 2,
                borderColor: theme.colors.primary,
              },
              member.isPaused && styles.pausedCard,
            ]}
            elevation={1}
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
          </Surface>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "bold",
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
  pausedCard: {
    opacity: 0.9,
  },
});
