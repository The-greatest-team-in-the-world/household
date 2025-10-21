import { currentHouseholdAtom } from "@/atoms/household-atom";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { useAtomValue } from "jotai";
import { useTheme } from "react-native-paper";

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabsLayout() {
  const household = useAtomValue(currentHouseholdAtom);
  const theme = useTheme();

  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarStyle: {
          display: "none",
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <MaterialTopTabs.Screen
        name="day-view"
        options={{ title: household?.name ?? "Fel" }}
      />
      <MaterialTopTabs.Screen name="(statistics)" />
    </MaterialTopTabs>
  );
}
