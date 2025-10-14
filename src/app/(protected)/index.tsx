import {
  currentHouseholdAtom,
  getUsersHouseholdsAtom,
  householdsAtom,
} from "@/atoms/household-atom";
import { useNavigation } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

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
          <Pressable key={h.id} onPress={() => handleSelectHousehold(h)}>
            <Text style={s.text}>{h.name}</Text>
          </Pressable>
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
  householdContainer: {
    padding: 20,
    gap: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  header: {
    fontSize: 45,
  },
  text: {
    fontSize: 15,
  },
});
