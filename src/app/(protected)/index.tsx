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
import AlertDialog from "@/components/alertDialog";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { ReauthModal } from "@/components/reauth-modal";
import SettingsSideSheet from "@/components/user-profile-slide";
import { router } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { IconButton, Surface, Text } from "react-native-paper";

export default function HouseholdsScreen() {
  const [reauthVisible, setReauthVisible] = useState(false);
  const [, setDeleting] = useState(false);
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
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [alertHeadline, setAlertHeadline] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

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

  interface alertProps {
    open: boolean;
    onClose: () => void;
    headLine: string;
    alertMsg: string;
    agreeText: string;
  }

  const alertPropsMsg: alertProps = {
    open: isAlertOpen,
    onClose: () => setAlertOpen(false),
    headLine: alertHeadline,
    alertMsg: alertMessage,
    agreeText: "OK",
  };

  async function performFinalDeleteAfterReauth() {
    try {
      setDeleting(true);

      const res = await deleteAccount();

      if (!res.success) {
        console.log("[delete] UI error:", res.error);

        switch (res.error?.code) {
          case "single-owner":
            setAlertHeadline("Kan inte ta bort kontot");
            setAlertMessage(
              "Du är enda admin i minst ett hushåll. Du måste antingen lämna över admin-rollen till någon annan eller ta bort hushållet först.",
            );
            setAlertOpen(true);
            break;
          default:
            setAlertHeadline("Fel");
            setAlertMessage(
              res.error?.message ?? "Något gick fel vid borttagning av kontot.",
            );
            setAlertOpen(true);
        }

        setDeleting(false);
        return;
      }

      // success:
      setVisible(false);
      setShouldRender(false);
      setDeleting(false);
      router.replace("/(auth)/login");
    } catch (err: any) {
      setDeleting(false);
      Alert.alert(
        "Fel",
        err.message ?? "Något oväntat gick fel vid borttagning av kontot.",
      );
    }
  }

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
    setReauthVisible(true);
    setVisible(false);
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
                <Text style={[s.text, (pending || paused) && s.textDisabled]}>
                  {h.name} {suffix}
                </Text>
                <View style={s.spacer} />
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
      <ReauthModal
        visible={reauthVisible}
        onDismiss={() => setReauthVisible(false)}
        onSuccess={async () => {
          setReauthVisible(false);

          await performFinalDeleteAfterReauth();
        }}
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
      <AlertDialog {...alertPropsMsg}></AlertDialog>
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
    flex: 1,
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
  spacer: {
    width: 8,
  },
  icon: { opacity: 0.8 },
  itemText: { fontSize: 16 },
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
    marginRight: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
