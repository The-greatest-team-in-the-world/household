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
import LottieView from "lottie-react-native";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";

export default function DayViewScreen() {
  const currentHousehold = useAtomValue(currentHouseholdAtom);
  const member = useAtomValue(currentHouseholdMember);
  const canCreate = member?.isOwner;

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
    const completedTodayIds = new Set(todaysCompletions.map((c) => c.choreId));

    return chores.filter((chore) => {
      const isMine = chore.assignedTo === member.userId;
      const doneToday = completedTodayIds.has(chore.id);
      return isMine && !doneToday;
    });
  }, [chores, member, todaysCompletions]);

  const allChoresToShow = useMemo(() => {
    const completedChoreIds = new Set(todaysCompletions.map((c) => c.choreId));

    return chores.filter((chore) => {
      if (
        member &&
        chore.assignedTo === member.userId &&
        !completedChoreIds.has(chore.id)
      ) {
        return false;
      }
      return true;
    });
  }, [chores, todaysCompletions, member]);

  const sortedAllChoresToShow = useMemo(() => {
    return [...allChoresToShow].sort((a, b) => {
      const aCompletedToday = todaysCompletions.some((c) => c.choreId === a.id);
      const bCompletedToday = todaysCompletions.some((c) => c.choreId === b.id);
      if (aCompletedToday === bCompletedToday) return 0;
      return aCompletedToday ? 1 : -1;
    });
  }, [allChoresToShow, todaysCompletions]);

  const renderChore = (chore: Chore) => {
    const choreCompletions = completions.filter((c) => c.choreId === chore.id);
    const choreCompletionsToday = todaysCompletions.filter(
      (completion) => completion.choreId === chore.id,
    );
    const isCompletedToday = choreCompletionsToday.length > 0;

    if (isCompletedToday) {
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
    } else {
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
    }
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
      <ScrollView
        fadingEdgeLength={20}
        contentContainerStyle={s.choreContentContainer}
      >
        {myChores.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Mina sysslor</Text>
            {myChores.map((chore) => {
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
            })}
          </View>
        )}

        {allChoresToShow.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Alla sysslor</Text>
            {sortedAllChoresToShow.map(renderChore)}
          </View>
        )}

        {allChoresToShow.length === 0 && myChores.length === 0 && (
          <View style={s.emptyState}>
            <Text style={[s.noChoresText, s.largeText]}>
              Du har inga sysslor ännu.
            </Text>
            <Text style={s.noChoresText}>
              Du kan skapa sysslor genom att trycka på knappen skapa syssla.
            </Text>
            <LottieView
              source={require("../../../assets/animations/Tumbleweed.json")}
              autoPlay
              style={s.lottieAni}
            />
          </View>
        )}
      </ScrollView>

      <View>
        {canCreate && (
          <CustomPaperButton
            text="Skapa syssla"
            icon="plus"
            mode="text"
            onPress={() => {
              router.push("/(protected)/create-chore");
            }}
          />
        )}
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
    paddingHorizontal: 20,
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
  lottieAni: {
    width: 300,
    height: 300,
    alignSelf: "center",
  },
  choreContentContainer: {
    paddingHorizontal: 10,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 5,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 120,
  },
  emptyStateText: {
    fontSize: 18,
  },
  mineEmpty: {
    fontSize: 14,
    fontStyle: "italic",
    marginLeft: 5,
    marginTop: 4,
  },
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
  noChoresText: {
    textAlign: "center",
  },
  largeText: {
    fontSize: 20,
  },
});
