import { signOutUser } from "@/api/auth";
import {
  currentHouseholdAtom,
  getUsersHouseholdsAtom,
  householdsAtom,
} from "@/atoms/household-atom";
import { CustomPaperButton } from "@/components/custom-paper-button";

import { MaterialIcons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Surface } from "react-native-paper";

export default function HouseholdsScreen() {
  const getHouseholds = useSetAtom(getUsersHouseholdsAtom);
  const households = useAtomValue(householdsAtom);
  const setCurrentHousehold = useSetAtom(currentHouseholdAtom);

  const navigation = useNavigation<any>();

  useEffect(() => {
    getHouseholds();
  }, [getHouseholds]);

  function handleSelectHousehold(h: any) {
    setCurrentHousehold(h);
    router.push("/(protected)/(top-tabs)/day-view");
  }

  function handleOpenSettings(h: any) {
    setCurrentHousehold(h);
    router.push("/(protected)/household-details");
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
          <Surface key={h.id} style={s.surface} elevation={2}>
            <View style={s.surfaceContent}>
              <Pressable
                style={s.surfaceInner}
                onPress={() => handleSelectHousehold(h)}
              >
                <Text style={s.itemText}>{h.name}</Text>
                <View style={s.spacer} />
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleOpenSettings(h);
                  }}
                  style={s.iconButton}
                >
                  <MaterialIcons
                    name={h.isOwner ? "settings" : "info"}
                    size={24}
                    color="#666"
                  />
                </Pressable>
              </Pressable>
            </View>
          </Surface>
        ))}
      </ScrollView>
      <View style={s.buttonContainer}>
        <CustomPaperButton
          icon="account-multiple-plus"
          text="Gå med i hushåll"
          color="#e0e0e0"
          onPress={() => router.push("/(protected)/join-household")}
        />
        <CustomPaperButton
          icon="home-plus"
          text="Skapa hushåll"
          color="#e0e0e0"
          onPress={() => router.push("/(protected)/create-household")}
        />
        <CustomPaperButton
          icon="logout"
          text="Logga ut"
          color="#e0e0e0"
          onPress={handleSignOut}
        />
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
  },
  surfaceContent: {
    borderRadius: 10,
    overflow: "hidden",
  },
  surfaceInner: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  spacer: {
    flex: 1,
  },
  iconButton: {
    padding: 4,
  },
  icon: { opacity: 0.8 },
  itemText: { fontSize: 16 },
});
