import { signOutUser } from "@/api/auth";
import { userAtom } from "@/atoms/auth-atoms";
import {
  currentHouseholdAtom,
  getUsersHouseholdsAtom,
  householdsAtom,
} from "@/atoms/household-atom";
import { getMemberByUserIdAtom } from "@/atoms/member-atom";
import { shouldRenderSlideAtom, slideVisibleAtom } from "@/atoms/ui-atom";
import SettingsSideSheet from "@/components/user-profile-slide";
import { router } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";

export default function HouseholdsScreen() {
  const getHouseholds = useSetAtom(getUsersHouseholdsAtom);
  const households = useAtomValue(householdsAtom);
  const setCurrentHousehold = useSetAtom(currentHouseholdAtom);
  const getMemberByUserId = useSetAtom(getMemberByUserIdAtom);
  const user = useAtomValue(userAtom);
  const canEnter = (h: any) => h.status === "active" && !h.isPaused;
  const visibleHouseholds = (households ?? []).filter(
    (h: any) => h.status === "active" || h.status === "pending",
  );
  const setVisible = useSetAtom(slideVisibleAtom);
  const setShouldRender = useSetAtom(shouldRenderSlideAtom);

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
    try {
      setVisible(false);
      setShouldRender(false);
      await signOutUser();
    } catch (e) {
      console.log(e);
    }
    router.replace("/(auth)/login");
  }

  async function handleDeleteAccount() {
    router.replace("/(auth)/delete-account");
  }

  return (
    <View style={s.Container}>
      <View style={s.headerContainer}>
        <Text style={s.header}>Dina hushåll</Text>
        <IconButton
          icon="account-circle-outline"
          size={40}
          onPress={() => setVisible(true)}
        />
      </View>

      <ScrollView style={s.householdContainer}>
        {visibleHouseholds.map((h: any) => {
          const pending = h.status === "pending";
          const paused = !!h.isPaused;
          const disabled = !canEnter(h);

          const suffix = pending
            ? "· väntar på godkännande"
            : paused
            ? "· pausad"
            : "";

          return (
            <Pressable
              key={h.id}
              onPress={disabled ? undefined : () => handleSelectHousehold(h)}
              disabled={disabled}
              style={[s.surfaceInner, (pending || paused) && s.rowDisabled]}
            >
              <Text style={[s.text, (pending || paused) && s.textDisabled]}>
                {h.name} {suffix}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <SettingsSideSheet
        onClose={() => setVisible(false)}
        onLogout={handleSignOut}
        onDelete={handleDeleteAccount}
      />
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 20,
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 20,
  },
  header: {
    fontSize: 35,
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
  rowDisabled: { opacity: 0.5 },
  textDisabled: { color: "#888", fontStyle: "italic" },
});
