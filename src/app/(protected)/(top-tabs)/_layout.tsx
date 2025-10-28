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
import { Pressable, StyleSheet, View } from "react-native";
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
      {screens.map((s) => (
        <MaterialTopTabs.Screen
          key={s.name}
          name={s.name}
          initialParams={{ chartSize: pieChartSize }}
          options={s.options}
          redirect={s.data.length === 0 ? true : false}
        />
      ))}
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
    state.index > 0 && navigation.navigate(state.routes[state.index - 1].name);
  };

  const goToNextTab = () => {
    state.index < state.routes.length - 1 &&
      navigation.navigate(state.routes[state.index + 1].name);
  };

  return (
    <View style={s.header}>
      <Pressable style={s.chevron} onPress={goToPreviousTab}>
        <Text>
          {state.index > 0 && <Ionicons name="chevron-back" size={16} />}
        </Text>
      </Pressable>
      <Text style={s.title}>{options.title}</Text>
      <Pressable style={s.chevron} onPress={goToNextTab}>
        <Text>
          {state.index < state.routes.length - 1 && (
            <Ionicons name="chevron-forward" size={16} />
          )}
        </Text>
      </Pressable>
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
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
  },
});
