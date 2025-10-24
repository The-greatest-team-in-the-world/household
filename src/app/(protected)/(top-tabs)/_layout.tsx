import { choreCompletionsAtom } from "@/atoms/chore-completion-atom";
import {
  getChoresFromCurrentMonth,
  getChoresFromLastMonth,
  getChoresFromLastWeek,
} from "@/utils/get-statistics-from-range";
import { Ionicons } from "@expo/vector-icons";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
} from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { useAtomValue } from "jotai";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabsLayout() {
  const theme = useTheme();

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
    <MaterialTopTabs
      tabBar={customTabBar}
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <MaterialTopTabs.Screen name="day-view" options={{ title: "Idag" }} />
      <MaterialTopTabs.Screen
        name="current-week"
        initialParams={{ chartSize: pieChartSize }}
        options={{ title: "Denna veckan" }}
      />
      {screens.map((s) => {
        return (
          <MaterialTopTabs.Screen
            key={s.name}
            name={s.name}
            initialParams={{ chartSize: pieChartSize }}
            options={s.options}
            redirect={s.data.length === 0 ? true : false}
          />
        );
      })}
    </MaterialTopTabs>
  );
}

const customTabBar = ({
  state,
  descriptors,
  navigation,
}: MaterialTopTabBarProps) => {
  const currentRoute = state.routes[state.index];
  const { options } = descriptors[currentRoute.key];

  const goToPreviousTab = () => {
    navigation.navigate(state.routes[state.index - 1].name);
  };

  const goToNextTab = () => {
    navigation.navigate(state.routes[state.index + 1].name);
  };

  return (
    <View style={s.header}>
      <Text style={s.chevron}>
        {state.index > 0 && (
          <Ionicons name="chevron-back" size={16} onPress={goToPreviousTab} />
        )}
      </Text>
      <Text style={s.title}>{options.title}</Text>
      <Text style={s.chevron} onPress={goToNextTab}>
        {state.index < state.routes.length - 1 && (
          <Ionicons name="chevron-forward" size={16} />
        )}
      </Text>
    </View>
  );
};

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    marginTop: 10,
  },
  title: {
    fontSize: 16,
  },
  chevron: {
    padding: 5,
  },
});
