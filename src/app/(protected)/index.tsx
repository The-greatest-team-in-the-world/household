import { signOutUser } from "@/api/auth";
import { userAtom } from "@/atoms/auth-atoms";
import {
  currentHouseholdAtom,
  getUsersHouseholdsAtom,
  householdsAtom,
} from "@/atoms/household-atom";
import { getMemberByUserIdAtom } from "@/atoms/member-atom";

import { router } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function HouseholdsScreen() {
  const getHouseholds = useSetAtom(getUsersHouseholdsAtom);
  const households = useAtomValue(householdsAtom);
  const setCurrentHousehold = useSetAtom(currentHouseholdAtom);
  const getMemberByUserId = useSetAtom(getMemberByUserIdAtom);
  const user = useAtomValue(userAtom);

  useEffect(() => {
    getHouseholds();
  }, [getHouseholds]);

  async function handleSelectHousehold(h: any) {
    if (user) {
      await getMemberByUserId({ householdId: h.id, userId: user.uid });
    }
    setCurrentHousehold(h);

    router.push("/(protected)/(top-tabs)/day-view");
  }

  async function handleSignOut() {
    await signOutUser();
    router.replace("/(auth)/login");
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
          onPress={() => router.push("/(protected)/join-household")}
        >
          joina
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/(protected)/create-household")}
        >
          skapa
        </Button>
        <Button mode="outlined" onPress={handleSignOut}>
          signout
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
