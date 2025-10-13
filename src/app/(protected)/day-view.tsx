import ChoreCard from "@/components/day-view/chore-card";
import { mockdataAtom } from "@/providers/mockdata-provider";
import { Chore } from "@/types/chore";
import getMemberAvatar from "@/utils/get-member-avatar";
import { useAtomValue } from "jotai";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function DayViewScreen() {
  const mockdata = useAtomValue(mockdataAtom);
  const household = mockdata.households[0];
  const completedChores = household.choreCompletions;
  const completedChoreIds = new Set<string>(
    completedChores.map((cc) => cc.choreId)
  );
  const notCompletedChores: Chore[] = household.chores.filter(
    (chore) => chore.id && !completedChoreIds.has(chore.id)
  );

  const getDaysAgo = (chore: Chore): string => {
    if (!chore.lastCompletedAt) return "0";

    const diffMs =
      new Date().getTime() - chore.lastCompletedAt.toDate().getTime();
    return Math.floor(diffMs / 86400000).toString();
  };

  return (
    <View style={s.container}>
      <View style={s.headerContainer}>
        <Text style={s.header}>{household.name}</Text>
      </View>

      <ScrollView style={s.choreContainer}>
        {completedChores.map((completedChore) => {
          const avatar = getMemberAvatar(completedChore.id);
          return (
            <ChoreCard
              key={completedChore.id}
              choreName={"Chore.name"}
              displayType="avatar"
              displayValue={avatar.emoji}
            />
          );
        })}

        {notCompletedChores.map((chore) => (
          <ChoreCard
            key={chore.id}
            choreName={chore.name}
            displayType="days"
            displayValue={getDaysAgo(chore)}
          />
        ))}
      </ScrollView>

      <View style={s.buttonContainer}>
        <Button
          icon="format-list-group-plus"
          mode="contained"
          onPress={() => console.log("Lägg till Pressed")}
        >
          Lägg till
        </Button>
        <Button
          icon="lead-pencil"
          mode="contained"
          onPress={() => console.log("ändra Pressed")}
        >
          Ändra
        </Button>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  headerContainer: {
    alignItems: "center",
    padding: 20,
  },
  choreContainer: {
    padding: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  header: {
    fontSize: 45,
  },
});
