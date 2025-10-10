import PieChart from "@/components/pie-chart";
import { ChoreCompletion } from "@/types/chore-completion";
import { Household } from "@/types/household";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface Props {
  household: Household;
}

export default function StatisticsScreen({household}: Props) {
  const groupedChores: Record<string, ChoreCompletion[]> = household.choreCompletions.reduce(
    (acc, chore) => {
      if (!acc[chore.choreId]) {
        acc[chore.choreId] = [];
      }
      acc[chore.choreId].push(chore);

      return acc;
    },
    {} as Record<string, ChoreCompletion[]>
  );

  const groupedChoresList = Object.values(groupedChores);

  return (
    <View style={s.container}>
      <View style={s.headerContainer}>
        <View>
          <Text style={s.header}>{household.name}</Text>
        </View>
        <View>
          <Text
            style={s.navigationIcon}
            onPress={() => console.log("chevron-left.pressed")}>
              {"<"}
            </Text>
          <Text>förra veckan</Text>
          <Text
            style={s.navigationIcon}
            onPress={() => console.log("chevron-right.pressed")}>
              {">"}
            </Text>
        </View>
      </View>

      <ScrollView>
        <View style={s.chartContainerTotal}>
          <PieChart total chores={household.choreCompletions} size={300}/>
        </View>
        <View style={s.chartContainerIndividual}>
          {groupedChoresList.map((group) => (
            <PieChart key={group[0].choreId} chores={group} size={150} />
          ))}
        </View>
      </ScrollView>

    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    padding: 20,
  },
  headerNavigation: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: {
    fontSize: 45,
  },
  navigationIcon: {
    fontSize: 24,
  },
  chartContainerTotal: {

  },
  chartContainerIndividual: {

  },
})