import { currentHouseholdAtom } from "@/atoms/household-atom";
import { currentHouseholdMember } from "@/atoms/member-atom";
import { CustomPaperButton } from "@/components/custom-paper-button";
import ChoreCard from "@/components/day-view/chore-card";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import { Chore } from "@/types/chore";
import {
  getDaysOverdue,
  getDaysSinceLastCompletion,
  getTodaysCompletions,
} from "@/utils/chore-helpers";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";

export default function DayViewScreen() {
  const currentHousehold = useAtomValue(currentHouseholdAtom);
  const member = useAtomValue(currentHouseholdMember);
  const canCreate = member?.isOwner;
  const [showMine, setShowMine] = useState(false);

  const householdId = currentHousehold?.id;

  const { completions, chores, members, isLoading } = useHouseholdData(
    householdId || "",
  );
  console.log("current member object:", member);

    const todaysCompletions = useMemo(() => {
    if (!householdId) return [];
    return getTodaysCompletions(completions) ?? [];
  }, [completions, householdId]);

  const myChores = useMemo(() => {
    if (!member) return [];
  const completedTodayIds = new Set(
    todaysCompletions.map((c) => c.choreId)
  );

  return chores.filter((chore) => {
    const isMine = chore.assignedTo === member.userId;

    const doneToday = completedTodayIds.has(chore.id);

    return isMine && !doneToday;
  });
}, [chores, member, todaysCompletions]);


  const completedChoresToday = useMemo(() => {
    const uniqueChoreIds = new Set(
      todaysCompletions.map((completion) => completion.choreId),
    );
    return chores.filter((chore) => uniqueChoreIds.has(chore.id));
  }, [todaysCompletions, chores]);

const incompleteChoresToday = useMemo(() => {
  const completedChoreIds = new Set(
    todaysCompletions.map((c) => c.choreId)
  );

  return chores.filter((chore) => {
   
    if (completedChoreIds.has(chore.id)) return false;

    if (
      showMine &&
      member &&
      chore.assignedTo === member.userId
    ) {
      return false;
    }

    return true;
  });
}, [chores, todaysCompletions, showMine, member]);

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
      <Surface style={s.loading} elevation={0}>
        <ActivityIndicator animating={true} size="large" />
      </Surface>
    );
  }

  return (
    <Surface style={s.container} elevation={0}>
      <View style={s.headerContainer}>
        <Text style={s.subheader}>
          {todaysCompletions.length} klara • {incompleteChoresToday.length} kvar
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.choreContentContainer}>
        {showMine && (
          <Surface style={s.mineBox} elevation={2}>
            <Text style={s.mineTitle}>Mina sysslor</Text>

            {myChores.length === 0 ? (
              <Text style={s.mineEmpty}>Du har inget tilldelat</Text>
            ) : (
              myChores.map((chore) => {
                const choreCompletions = completions.filter(
                  (c) => c.choreId === chore.id,
                );
                const daysSinceCompletion = getDaysSinceLastCompletion(
                  chore,
                  choreCompletions,
                );
                const daysOverdue = getDaysOverdue(chore, choreCompletions);

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
              })
            )}
          </Surface>
        )}

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
          incompleteChoresToday.length === 0 &&
          (!showMine || myChores.length === 0) && (
            <View style={s.emptyState}>
              <Text style={s.emptyStateText}>🎉 Allt är klart!</Text>
            </View>
          )}
      </ScrollView>

      <View style={[canCreate ? s.buttonRowTwo : s.buttonRowSingle]}>
        {canCreate && (
          <CustomPaperButton
            text="Skapa syssla"
            icon="plus"
            mode="contained"
            onPress={() => {
              router.push("/(protected)/create-chore");
            }}
            style={s.buttonFlex}
          />
        )}

        <CustomPaperButton
          icon="account-details-outline"
          text={showMine ? "Dölj mina sysslor" : "Mina sysslor"}
          onPress={() => setShowMine(!showMine)}
          mode="contained"
          style={canCreate ? s.buttonFlex : s.buttonFull}
        />
      </View>
    </Surface>
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
    marginTop: 4,
  },
  choreContentContainer: {
    gap: 16,
    paddingHorizontal: 5,
    paddingBottom: 20,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
  },

  mineBox: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,

    gap: 8,
  },
  mineTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    opacity: 0.8,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  mineEmpty: {
    fontSize: 14,
    fontStyle: "italic",
  },

  // knapplayout
  buttonRowTwo: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 20,
  },
  buttonRowSingle: {
    paddingBottom: 20,
  },
  buttonFlex: {
    flex: 1,
  },
  buttonFull: {
    width: "100%",
  },
});
