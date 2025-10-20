import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";

const { Navigator } = createMaterialTopTabNavigator();
const StatisticsNavigator = withLayoutContext(Navigator);

export default function StatisticsLayout() {
  const pieChartSize = 100;

  return (
    <StatisticsNavigator screenOptions={{}}>
      <StatisticsNavigator.Screen
        name="current-week"
        initialParams={{ chartSize: pieChartSize }}
        options={{ title: "Denna veckan" }}
      />
      <StatisticsNavigator.Screen
        name="last-week"
        initialParams={{ chartSize: pieChartSize }}
        options={{ title: "Förra veckan" }}
      />
      <StatisticsNavigator.Screen
        name="current-month"
        initialParams={{ chartSize: pieChartSize }}
        options={{ title: "Denna månaden" }}
      />
      <StatisticsNavigator.Screen
        name="last-month"
        initialParams={{ chartSize: pieChartSize }}
        options={{ title: "Förra månaden" }}
      />
    </StatisticsNavigator>
  );
}
