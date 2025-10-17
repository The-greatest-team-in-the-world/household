import { currentHouseholdAtom } from "@/atoms/household-atom";
import { CustomPaperButton } from "@/components/custom-paper-button";
import ChoreCard from "@/components/day-view/chore-card";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import { Chore } from "@/types/chore";
import { ChoreCompletion } from "@/types/chore-completion";
import {
  getDaysOverdue,
  getDaysSinceLastCompletion,
} from "@/utils/chore-helpers";
import getMemberAvatar from "@/utils/get-member-avatar";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export default function DayViewScreen() {
  const currentHousehold = useAtomValue(currentHouseholdAtom);

  const householdId = currentHousehold?.id;

  const { chores, completions, incompleteChores, members, isLoading } =
    useHouseholdData(householdId || "");

  const todaysCompletions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return completions.filter((completion) => {
      const completedDate = completion.completedAt.toDate();
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });
  }, [completions]);

  const getChoreName = (choreId: string): string => {
    const chore = chores.find((c) => c.id === choreId);
    return chore?.name || "Okänd syssla";
  };

  const renderCompletedChore = (completion: ChoreCompletion) => {
    const avatar = getMemberAvatar(members, completion.userId);
    return (
      <ChoreCard
        key={completion.id}
        choreId={completion.choreId}
        choreName={getChoreName(completion.choreId)}
        displayType="avatar"
        displayValue={avatar.emoji}
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
          {todaysCompletions.length} klara • {incompleteChores.length} kvar
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.choreContentContainer}>
        {incompleteChores.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Behöver göras</Text>
            {incompleteChores.map(renderIncompleteChore)}
          </View>
        )}
        {todaysCompletions.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Klart för idag ✓</Text>
            {todaysCompletions.map(renderCompletedChore)}
          </View>
        )}
        {todaysCompletions.length === 0 && incompleteChores.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyStateText}>🎉 Allt är klart!</Text>
          </View>
        )}
      </ScrollView>

      <View style={s.buttonContainer}>
        <CustomPaperButton
          icon="information-outline"
          text="Mer info"
          color="#06BA63"
          onPress={() => console.log("Mer info")}
        />
        <CustomPaperButton
          icon="account-details-outline"
          text="Mina sysslor"
          color="#06BA63"
          onPress={() => console.log("Mina sysslor")}
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
