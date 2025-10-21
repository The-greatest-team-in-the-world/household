import { HouseholdMember } from "@/types/household-member";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

interface PendingMemberCardProps {
  member: HouseholdMember;
}

export function PendingMemberCard({ member }: PendingMemberCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: member.avatar.color }]}>
        <Text style={styles.avatarEmoji}>{member.avatar.emoji}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text variant="bodyLarge">{member.nickName}</Text>
        <Text variant="bodySmall" style={styles.pendingText}>
          Väntar på godkännande
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
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
});
