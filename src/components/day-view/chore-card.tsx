import { getChoreById } from "@/api/chores";
import { selectedChoreAtom } from "@/atoms/chore-atom";
import { currentHouseholdAtom } from "@/atoms/household-atom";
import { useNavigation } from "@react-navigation/native";
import { useAtomValue, useSetAtom } from "jotai";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ChoreCardProps = {
  choreId: string;
  choreName: string;
  displayType: "avatar" | "days";
  displayValue: string;
  isOverdue?: boolean;
  daysOverdue?: number;
};

export default function ChoreCard({
  choreId,
  choreName,
  displayType,
  displayValue,
  isOverdue = false,
  daysOverdue = 0,
}: ChoreCardProps) {
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
    <Pressable onPress={handlePress}>
      <View style={s.container}>
        <Text style={s.choreName}>{choreName}</Text>

        {displayType === "avatar" ? (
          <View style={s.avatarContainer}>
            <Text style={s.avatar}>{displayValue}</Text>
          </View>
        ) : (
          <View style={[s.daysContainer, isOverdue && s.daysContainerOverdue]}>
            <Text style={[s.days, isOverdue && s.daysOverdue]}>
              {isOverdue ? `-${daysOverdue}` : displayValue}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e2e2e2ff",
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    fontSize: 24,
  },
  daysContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ffffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  daysContainerOverdue: {
    backgroundColor: "#d32f2f",
  },
  days: {
    fontSize: 13,
    fontWeight: "600",
  },
  daysOverdue: {
    color: "#ffffff",
  },
});
