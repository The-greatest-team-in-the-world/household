import { HouseholdMember } from "@/types/household-member";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { IconButton, Surface, Text, useTheme } from "react-native-paper";

interface ActiveMemberCardProps {
  member: HouseholdMember;
  onMakeOwner?: (userId: string) => void;
  onRemoveOwnership?: (userId: string) => void;
  onTogglePause?: (userId: string) => void;
  currentUserId?: string;
}

export function ActiveMemberCard({
  member,
  onMakeOwner,
  onRemoveOwnership,
  onTogglePause,
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
        member.isPaused && styles.pausedCard,
      ]}
      elevation={1}
    >
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          { backgroundColor: member.avatar.color },
          member.isPaused && styles.paused,
        ]}
      >
        <Text style={[styles.emoji, member.isPaused && styles.paused]}>
          {member.avatar.emoji}
        </Text>
      </View>

      {/* Member info */}
      <View style={[styles.info, member.isPaused && styles.paused]}>
        <Text variant="bodyLarge" style={styles.nickname}>
          {member.nickName}
        </Text>
        {member.isPaused && (
          <Text
            variant="bodySmall"
            style={[
              styles.pausedText,
              { color: (theme.colors as any).pausedText },
            ]}
          >
            Pausad
          </Text>
        )}
      </View>

      {/* Pause/Play button */}
      {onTogglePause && (
        <IconButton
          icon={member.isPaused ? "play" : "pause"}
          size={24}
          onPress={() => onTogglePause(member.userId)}
          style={styles.iconButton}
        />
      )}

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
  paused: {
    opacity: 0.5,
  },
  pausedCard: {
    opacity: 0.9,
  },
  pausedText: {
    fontStyle: "italic",
    opacity: 0.8,
  },
});
