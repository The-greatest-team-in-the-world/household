import { authStateAtom } from "@/atoms/auth-atoms";
import { db } from "@/data/mock-db";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import { Redirect } from "expo-router";
import { useAtomValue } from "jotai";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import StatisticsScreen from "./(statistics)/statistics";
import DayViewScreen from "./day-view";

export default function ProtectedLayout() {
  const authState = useAtomValue(authStateAtom);

  if (authState.isLoading) return;

  if (!authState.isAuthenticated) {
    return <Redirect href="../(auth)/login" />;
  }

  const household = db.households.find((h) => h.id === "house-ankeborg");

  if (!household) return null;

  const Tab = createMaterialTopTabNavigator();

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <View>
          <Text style={s.header}>{household.name}</Text>
        </View>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { display: "none" },
          }}
        >
          <Tab.Screen
            name="DayView"
            component={DayViewScreen}
            options={{ title: "Idag" }}
          />
          <Tab.Screen
            name="(statistics)/statistics"
            component={StatisticsScreen}
            options={{ title: "Statistics" }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

const s = StyleSheet.create({
  header: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    margin: 10,
  },
});
