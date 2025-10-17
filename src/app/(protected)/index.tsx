import {
  currentHouseholdAtom,
  getUsersHouseholdsAtom,
  householdsAtom,
} from "@/atoms/household-atom";
import { useNavigation } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Surface } from "react-native-paper";

export default function HouseholdsScreen() {
  const getHouseholds = useSetAtom(getUsersHouseholdsAtom);
  const households = useAtomValue(householdsAtom);
  const setCurrentHousehold = useSetAtom(currentHouseholdAtom);
  //const router = useRouter();

  const navigation = useNavigation<any>();

  useEffect(() => {
    getHouseholds();
  }, [getHouseholds]);

  function handleSelectHousehold(h: any) {
    setCurrentHousehold(h);
    //router.push("/(protected)/day-view");
    navigation.navigate("DayView");
  }

  return (
    <View style={s.Container}>
      <View style={s.headerContainer}>
        <Text style={s.header}>Dina hushåll</Text>
      </View>

      <ScrollView style={s.householdContainer}>
        {(households ?? []).map((h) => (
          <Surface key={h.id} style={s.surface} elevation={1}>
            <Pressable
              onPress={() => handleSelectHousehold(h)}
              style={s.surfaceInner}
            >
              <Text style={s.itemText}>{h.name}</Text>
            </Pressable>
          </Surface>
        ))}
      </ScrollView>
      <View style={s.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => console.log("Skapa nytt hushåll")}
        >
          Skapa nytt hushåll
        </Button>
        <Button
          mode="contained"
          onPress={() => console.log("Gå med i hushåll")}
        >
          Gå med i hushåll
        </Button>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    padding: 20,
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 20,
  },
  header: {
    fontSize: 45,
  },
  text: {
    fontSize: 20,
  },
  householdContainer: { paddingHorizontal: 16, marginBottom: 20 },
  surface: {
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  surfaceInner: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: { opacity: 0.8 },
  itemText: { fontSize: 16 },
});
