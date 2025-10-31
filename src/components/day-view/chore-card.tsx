import { getChoreById } from "@/api/chores";
import { selectedChoreAtom } from "@/atoms/chore-atom";
import { currentHouseholdAtom } from "@/atoms/household-atom";
import { ChoreCompletion } from "@/types/chore-completion";
import { HouseholdMember } from "@/types/household-member";
import getMemberAvatar from "@/utils/get-member-avatar";
import { useNavigation } from "@react-navigation/native";
import { useAtomValue, useSetAtom } from "jotai";
import { Pressable, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";

type ChoreCardProps = {
  choreId: string;
  choreName: string;
  displayType: "avatar" | "days";
  displayValue?: string;
  isOverdue?: boolean;
  daysOverdue?: number;
  completedByList?: ChoreCompletion[];
  members?: HouseholdMember[];
};

export default function ChoreCard({
  choreId,
  choreName,
  displayType,
  displayValue,
  isOverdue = false,
  daysOverdue = 0,
  completedByList,
  members = [],
}: ChoreCardProps) {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const setSelectedChore = useSetAtom(selectedChoreAtom);
  const currentHousehold = useAtomValue(currentHouseholdAtom);
  const householdId = currentHousehold?.id;

  const handlePress = () => {
    if (!householdId) {
      console.error("No household ID available");
      return;
    }
    getChore();
    navigation.navigate("chore-details");
  };

  const getChore = () => {
    if (!householdId) return;
    getChoreById(householdId, choreId).then((chore) => {
      console.log("Fetched chore:", chore);
      setSelectedChore(chore);
    });
  };

  return (
    <View>
      {displayType === "avatar" ? (
        <Pressable onPress={handlePress}>
          <Surface style={s.container} elevation={1}>
            <Text style={s.choreName}>{choreName}</Text>
            <View style={s.avatarContainer}>
              {completedByList?.map((completion) => {
                const avatar = getMemberAvatar(members, completion.userId);
                return (
                  <Text key={completion.id} style={s.avatar}>
                    {avatar.emoji}
                  </Text>
                );
              })}
            </View>
          </Surface>
        </Pressable>
      ) : (
        <Pressable onPress={handlePress}>
          <Surface style={s.container}>
            <Text style={s.choreName}>{choreName}</Text>
            <View
              style={[
                s.daysContainer,
                {
                  backgroundColor: isOverdue
                    ? theme.colors.error
                    : theme.colors.onTertiary,
                },
              ]}
            >
              <Text
                style={[
                  s.days,
                  {
                    color: isOverdue
                      ? theme.colors.onTertiary
                      : theme.colors.shadow,
                  },
                ]}
              >
                {isOverdue ? daysOverdue : displayValue}
              </Text>
            </View>
          </Surface>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  choreName: {
    fontSize: 16,
    flex: 1,
  },
  avatarContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  avatar: {
    fontSize: 24,
    width: 30,
    height: 30,
    textAlign: "center",
    lineHeight: 30,
  },
  daysContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  days: {
    fontSize: 13,
    fontWeight: "600",
  },
});
