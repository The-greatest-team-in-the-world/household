import { choresAtom } from "@/atoms/chore-atom";
import { choreCompletionsAtom } from "@/atoms/chore-completion-atom";
import { membersAtom } from "@/atoms/member-atom";
import PieChart from "@/components/pie-chart";
import { ChoreCompletion } from "@/types/chore-completion";
import { getChoresFromCurrentWeek } from "@/utils/get-statistics-from-range";
import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default function CurrentWeekStatisticsScreen() {
  const completions = getChoresFromCurrentWeek(
    useAtomValue(choreCompletionsAtom),
  );
  const members = useAtomValue(membersAtom);
  const chores = useAtomValue(choresAtom);

  const { chartSize } = useLocalSearchParams<{ chartSize: string }>();
  const pieChartSize = Number(chartSize ?? 100);

  const groupedChores: Record<string, ChoreCompletion[]> = completions.reduce<
    Record<string, ChoreCompletion[]>
  >((acc, chore) => {
    if (!acc[chore.choreId]) {
      acc[chore.choreId] = [];
    }
    acc[chore.choreId].push(chore);

    return acc;
  }, {});

  const groupedChoresList = Object.values(groupedChores);

  if (completions.length === 0) {
    return (
      <View style={s.noChoresContainer}>
        <Text>Inga sysslor är registrerade för den här veckan ännu.</Text>
        <Text>Börja med att lägga till eller markera en syssla som klar!</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={s.chartContainerTotal}>
        <PieChart
          total
          completedChores={completions}
          chores={chores}
          members={members}
          size={250}
          iconSize={24}
          titleSize={18}
        />
      </View>
      <View style={s.chartContainerIndividual}>
        {groupedChoresList.map((group) => {
          return (
            <View
              key={group[0].choreId}
              style={[s.pieChart, { width: pieChartSize }]}
            >
              <PieChart
                completedChores={group}
                chores={chores}
                members={members}
                size={pieChartSize}
                titleSize={12}
              />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  noChoresContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chartContainerTotal: {
    margin: 20,
  },
  chartContainerIndividual: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: "auto",
    gap: 15,
  },
  pieChart: {
    alignItems: "center",
    justifyContent: "center",
  },
});
