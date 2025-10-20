import { choreCompletionsAtom } from "@/atoms/chore-completion-atom";
import {
  getChoresFromCurrentMonth,
  getChoresFromLastMonth,
  getChoresFromLastWeek,
} from "@/utils/get-statistics-from-range";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { useAtomValue } from "jotai";

const { Navigator } = createMaterialTopTabNavigator();
const StatisticsNavigator = withLayoutContext(Navigator);

export default function StatisticsLayout() {
  const completions = useAtomValue(choreCompletionsAtom);
  const pieChartSize = 100;

  const screens = [
    {
      name: "last-week",
      options: { title: "Förra veckan" },
      data: getChoresFromLastWeek(completions),
    },
    {
      name: "current-month",
      options: { title: "Denna månaden" },
      data: getChoresFromCurrentMonth(completions),
    },
    {
      name: "last-month",
      options: { title: "Förra månaden" },
      data: getChoresFromLastMonth(completions),
    },
  ];

  return (
    <StatisticsNavigator>
      <StatisticsNavigator.Screen
        name="current-week"
        initialParams={{ chartSize: pieChartSize }}
        options={{ title: "Denna veckan" }}
      />
      {screens.map((s) => {
        return (
          <StatisticsNavigator.Screen
            key={s.name}
            name={s.name}
            initialParams={{ chartSize: pieChartSize }}
            options={s.options}
            redirect={s.data.length === 0 ? true : false}
          />
        );
      })}
    </StatisticsNavigator>
  );
}
