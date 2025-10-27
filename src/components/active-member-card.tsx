import { HouseholdMember } from "@/types/household-member";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { IconButton, Surface, Text, useTheme } from "react-native-paper";

interface ActiveMemberCardProps {
  member: HouseholdMember;
  onMakeOwner?: (userId: string) => void;
  onRemoveOwnership?: (userId: string) => void;
  currentUserId?: string;
}

export function ActiveMemberCard({
  member,
  onMakeOwner,
  onRemoveOwnership,
  currentUserId,
}: ActiveMemberCardProps) {
  const theme = useTheme();
  const isCurrentUser = member.userId === currentUserId;

  return (
    <Surface
      style={[
        styles.card,
        isCurrentUser && {
          borderWidth: 2,
          borderColor: theme.colors.primary,
        },
      ]}
      elevation={1}
    >
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

      {/* Owner icon or Make Owner button */}
      <View style={styles.ownerBadge}>
        {member.isOwner ? (
          onRemoveOwnership ? (
            <IconButton
              icon="star"
              iconColor="#FFD700"
              size={20}
              onPress={() => onRemoveOwnership(member.userId)}
              style={styles.iconButton}
            />
          ) : (
            <MaterialIcons name="star" size={20} color="#FFD700" />
          )
        ) : (
          onMakeOwner && (
            <IconButton
              icon="star-outline"
              size={20}
              onPress={() => onMakeOwner(member.userId)}
              style={styles.iconButton}
            />
          )
        )}
      </View>
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
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  iconButton: {
    margin: 0,
    padding: 0,
  },
});
