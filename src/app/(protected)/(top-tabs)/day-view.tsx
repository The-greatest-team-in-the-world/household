import { currentHouseholdAtom } from "@/atoms/household-atom";
import { CustomPaperButton } from "@/components/custom-paper-button";
import ChoreCard from "@/components/day-view/chore-card";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import { Chore } from "@/types/chore";
import {
  getDaysOverdue,
  getDaysSinceLastCompletion,
  getTodaysCompletions,
} from "@/utils/chore-helpers";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export default function DayViewScreen() {
  const currentHousehold = useAtomValue(currentHouseholdAtom);

  const householdId = currentHousehold?.id;

  const { completions, chores, members, isLoading } = useHouseholdData(
    householdId || "",
  );

  const todaysCompletions = useMemo(() => {
    if (!householdId) return [];
    return getTodaysCompletions(completions) ?? [];
  }, [completions, householdId]);

  const completedChoresToday = useMemo(() => {
    const uniqueChoreIds = new Set(
      todaysCompletions.map((completion) => completion.choreId),
    );
    return chores.filter((chore) => uniqueChoreIds.has(chore.id));
  }, [todaysCompletions, chores]);

  const incompleteChoresToday = useMemo(() => {
    const completedChoreIds = new Set(
      todaysCompletions.map((completion) => completion.choreId),
    );
    return chores.filter((chore) => !completedChoreIds.has(chore.id));
  }, [todaysCompletions, chores]);

  const renderCompletedChore = (chore: Chore) => {
    const choreCompletionsToday = todaysCompletions.filter(
      (completion) => completion.choreId === chore.id,
    );

    return (
      <ChoreCard
        key={chore.id}
        choreId={chore.id}
        choreName={chore.name}
        displayType="avatar"
        completedByList={choreCompletionsToday}
        members={members}
      />
    );
  };

  const renderIncompleteChore = (chore: Chore) => {
    const choreCompletions = completions.filter((c) => c.choreId === chore.id);
    const daysOverdue = getDaysOverdue(chore, choreCompletions);
    const daysSinceCompletion = getDaysSinceLastCompletion(
      chore,
      choreCompletions,
    );

    return (
      <ChoreCard
        key={chore.id}
        choreId={chore.id}
        choreName={chore.name}
        displayType="days"
        displayValue={daysSinceCompletion.toString()}
        isOverdue={daysOverdue > 0}
        daysOverdue={daysOverdue}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={s.loading}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.headerContainer}>
        <Text style={s.subheader}>
          {todaysCompletions.length} klara • {incompleteChoresToday.length} kvar
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.choreContentContainer}>
        {incompleteChoresToday.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Behöver göras</Text>
            {incompleteChoresToday.map(renderIncompleteChore)}
          </View>
        )}
        {completedChoresToday.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Klart för idag ✓</Text>
            {completedChoresToday.map(renderCompletedChore)}
          </View>
        )}
        {todaysCompletions.length === 0 &&
          incompleteChoresToday.length === 0 && (
            <View style={s.emptyState}>
              <Text style={s.emptyStateText}>🎉 Allt är klart!</Text>
            </View>
          )}
      </ScrollView>

      <View style={s.buttonContainer}>
        <CustomPaperButton
          icon="information-outline"
          text="Mer info"
          onPress={() => console.log("Mer info")}
          mode="outlined"
        />
        <CustomPaperButton
          icon="account-details-outline"
          text="Mina sysslor"
          onPress={() => console.log("Mina sysslor")}
          mode="outlined"
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 25,
    fontWeight: "600",
  },
  subheader: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 5,
  },
  choreContentContainer: {
    gap: 5,
    paddingHorizontal: 5,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 20,
  },
});
