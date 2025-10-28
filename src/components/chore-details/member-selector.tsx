import { HouseholdMember } from "@/types/household-member";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  members: HouseholdMember[];
  value: string | null; // userId eller null
  onValueChange: (value: string | null) => void;
  error?: string;
};

export default function MemberSelector({
  members,
  value,
  onValueChange,
  error,
}: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  const selectedMember = members.find((m) => m.userId === value);

  const displayEmoji = selectedMember ? selectedMember.avatar.emoji : "👥";

  const displayName = selectedMember
    ? selectedMember.nickName
    : "Ingen tilldelad";

  const allOptions: Array<
    | {
        userId: null;
        nickName: string;
        avatar: { emoji: string; color: string };
      }
    | HouseholdMember
  > = [...members];

  function handleSelect(userId: string | null) {
    if (value === userId) {
      onValueChange(null);
    } else {
      onValueChange(userId);
    }
    close();
  }

  return (
    <View style={s.wrapper}>
      <Pressable style={s.selectorRow} onPress={toggle}>
        <View style={s.leftContent}>
          <Text style={s.emoji}>{displayEmoji}</Text>
          <Text style={s.selectedText}>{displayName}</Text>
        </View>

        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      </Pressable>

      {error && <Text style={s.errorText}>{error}</Text>}

      {open && (
        <Surface style={s.dropdown} elevation={4}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}
          >
            {allOptions.map((option) => {
              const isSelected = value === option.userId;

              return (
                <Pressable
                  key={option.userId ?? "none"}
                  onPress={() => handleSelect(option.userId)}
                  style={s.memberOption}
                >
                  <Surface
                    style={[
                      s.avatarContainer,
                      {
                        backgroundColor: option.avatar.color,
                        borderColor: isSelected
                          ? theme.colors.primary
                          : "transparent",
                        borderWidth: isSelected ? 3 : 0,
                      },
                    ]}
                    elevation={isSelected ? 3 : 1}
                  >
                    <Text style={s.avatarEmoji}>{option.avatar.emoji}</Text>
                  </Surface>

                  <Text
                    style={[
                      s.memberName,
                      {
                        color: isSelected
                          ? theme.colors.primary
                          : theme.colors.onSurface,
                        fontWeight: isSelected ? "bold" : "normal",
                      },
                    ]}
                  >
                    {option.nickName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Surface>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 4,
    justifyContent: "space-between",
  },

  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  emoji: {
    fontSize: 20,
  },

  selectedText: {
    fontSize: 16,
  },

  errorText: {
    fontSize: 12,
    marginLeft: 12,
    marginTop: 4,
  },

  dropdown: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    maxHeight: 130,
  },

  scrollContent: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },

  memberOption: {
    alignItems: "center",
    gap: 6,
  },

  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarEmoji: {
    fontSize: 28,
  },

  memberName: {
    fontSize: 12,
    maxWidth: 70,
    textAlign: "center",
  },
});
