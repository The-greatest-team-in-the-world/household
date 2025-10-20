import { currentHouseholdAtom } from "@/atoms/household-atom";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { useAtomValue } from "jotai";

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabsLayout() {
  const household = useAtomValue(currentHouseholdAtom);

  return (
    <MaterialTopTabs screenOptions={{ tabBarStyle: { display: "none" } }}>
      <MaterialTopTabs.Screen
        name="day-view"
        options={{ title: household?.name ?? "Fel" }}
      />
      <MaterialTopTabs.Screen name="(statistics)" />
    </MaterialTopTabs>
  );
}
