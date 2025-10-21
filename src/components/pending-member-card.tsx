import { HouseholdMember } from "@/types/household-member";
import { StyleSheet, View } from "react-native";
import { IconButton, Surface, Text } from "react-native-paper";

interface PendingMemberCardProps {
  member: HouseholdMember;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}

export function PendingMemberCard({
  member,
  onApprove,
  onReject,
}: PendingMemberCardProps) {
  return (
    <Surface style={styles.card} elevation={1}>
      <View style={[styles.avatar, { backgroundColor: member.avatar.color }]}>
        <Text style={styles.avatarEmoji}>{member.avatar.emoji}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text variant="bodyLarge">{member.nickName}</Text>
        <Text variant="bodySmall" style={styles.pendingText}>
          Väntar på godkännande
        </Text>
      </View>
      <View style={styles.actions}>
        <IconButton
          icon="check"
          iconColor="#4caf50"
          size={24}
          onPress={() => onApprove(member.userId)}
        />
        <IconButton
          icon="close"
          iconColor="#f44336"
          size={24}
          onPress={() => onReject(member.userId)}
        />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 30,
  },
  memberInfo: {
    flex: 1,
  },
  pendingText: {
    color: "#ff9800",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
});
