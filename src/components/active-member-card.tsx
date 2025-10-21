import { HouseholdMember } from "@/types/household-member";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";

interface ActiveMemberCardProps {
  member: HouseholdMember;
}

export function ActiveMemberCard({ member }: ActiveMemberCardProps) {
  return (
    <Surface style={styles.card} elevation={1}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: member.avatar.color }]}>
        <Text style={styles.emoji}>{member.avatar.emoji}</Text>
      </View>

      {/* Member info */}
      <View style={styles.info}>
        <Text variant="bodyLarge" style={styles.nickname}>
          {member.nickName}
        </Text>
      </View>

      {/* Owner icon */}
      {member.isOwner && (
        <View style={styles.ownerBadge}>
          <MaterialIcons name="star" size={20} color="#FFD700" />
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  nickname: {
    fontWeight: "600",
  },
  ownerBadge: {
    marginLeft: 8,
  },
});
