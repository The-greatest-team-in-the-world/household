import { db } from "@/data/mock-db";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabsLayout() {
  const household = db.households.find((h) => h.id === "house-ankeborg");
  if (!household) return null;

  return (
    <MaterialTopTabs screenOptions={{ tabBarStyle: { display: "none" } }}>
      <MaterialTopTabs.Screen
        name="day-view"
        options={{ title: household.name }}
      />
      <MaterialTopTabs.Screen name="(statistics)/statistics" />
    </MaterialTopTabs>
  );
}
