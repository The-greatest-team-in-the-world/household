import { deleteAccount, signOutUser } from "@/api/auth";
import { userAtom } from "@/atoms/auth-atoms";
import {
  currentHouseholdAtom,
  householdsAtom,
  initHouseholdsListenerAtom,
} from "@/atoms/household-atom";
import {
  getMemberByUserIdAtom,
  initPendingMembersListenerAtom,
  pendingMembersCountAtom,
} from "@/atoms/member-atom";
import { shouldRenderSlideAtom, slideVisibleAtom } from "@/atoms/ui-atom";
import { CustomPaperButton } from "@/components/custom-paper-button";
import SettingsSideSheet from "@/components/user-profile-slide";
import { router } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { IconButton, Surface, Text } from "react-native-paper";

export default function HouseholdsScreen() {
  const initHouseholdsListener = useSetAtom(initHouseholdsListenerAtom);
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
  const initPendingListener = useSetAtom(initPendingMembersListenerAtom);
  const pendingCounts = useAtomValue(pendingMembersCountAtom);

  // Set up real-time listener for households
  useEffect(() => {
    if (!user?.uid) return;

    console.log("Setting up households listener for user:", user.uid);
    const unsubscribe = initHouseholdsListener(user.uid);

    return () => {
      console.log("Cleaning up households listener");
      unsubscribe();
    };
  }, [user?.uid, initHouseholdsListener]);

  // Set up listeners for pending members count for each household where user is owner
  useEffect(() => {
    if (!visibleHouseholds || visibleHouseholds.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    visibleHouseholds.forEach((h: any) => {
      if (h.isOwner) {
        const unsubscribe = initPendingListener(h.id);
        unsubscribers.push(unsubscribe);
      }
    });

    // Cleanup all listeners when component unmounts or households change
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [visibleHouseholds, initPendingListener]);

  async function handleSelectHousehold(h: any) {
    if (user) {
      await getMemberByUserId({ householdId: h.id, userId: user.uid });
    }
    setCurrentHousehold(h);

    router.push("/(protected)/(top-tabs)/day-view");
  }

  function handleOpenSettings(h: any) {
    setCurrentHousehold(h);
    router.push("/(protected)/household-details");
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

  function handleDeleteAccount() {
    Alert.alert(
      "Ta bort konto",
      "Detta tar bort ditt konto permanent. Är du säker?",
      [
        {
          text: "Avbryt",
          style: "cancel",
        },
        {
          text: "Ta bort",
          style: "destructive",
          onPress: async () => {
            const res = await deleteAccount();
            if (!res.success) {
              console.log("[delete] UI error:", res.error);
              switch (res.error?.code) {
                case "single-owner":
                  Alert.alert(
                    "Kan inte ta bort kontot",
                    "Du är enda admin i minst ett hushåll. Du måste antingen lämna över admin-rollen till någon annan eller ta bort hushållet först.",
                  );
                  break;
                case "reauth-required":
                  Alert.alert(
                    "Logga in igen",
                    "Av säkerhetsskäl måste du logga in igen innan du kan radera kontot. Logga ut och sedan in igen, och försök sedan ta bort kontot direkt.",
                  );
                  break;
                default:
                  Alert.alert(
                    "Fel",
                    res.error?.message ??
                      "Något gick fel vid borttagning av kontot.",
                  );
              }
              return;
            }
            setVisible(false);
            setShouldRender(false);
            router.replace("/(auth)/login");
          },
        },
      ],
    );
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
              <Surface style={s.householdSurface} elevation={1}>
                <View style={s.householdContent}>
                  <Text style={[s.text, (pending || paused) && s.textDisabled]}>
                    {h.name} {suffix}
                  </Text>
                  {h.isOwner && pendingCounts[h.id] > 0 && (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleOpenSettings(h);
                      }}
                      style={s.badge}
                    >
                      <Text style={s.badgeText}>{pendingCounts[h.id]}</Text>
                    </Pressable>
                  )}
                </View>
              </Surface>
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
        <CustomPaperButton
          mode="contained"
          icon="account-multiple-plus"
          text="Gå med i hushåll"
          onPress={() => router.push("/(protected)/join-household")}
        />
        <CustomPaperButton
          mode="contained"
          icon="home-plus"
          text="Skapa hushåll"
          onPress={() => router.push("/(protected)/create-household")}
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 20,
  },
  householdSurface: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  householdContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  },
  surfaceContent: {
    borderRadius: 10,
    overflow: "hidden",
  },
  surfaceInner: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rowDisabled: { opacity: 0.5 },
  textDisabled: { color: "#888", fontStyle: "italic" },
  badge: {
    backgroundColor: "#f44336",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
