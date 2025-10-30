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
import NotFound from "@/components/not-found";
import { ReauthModal } from "@/components/reauth-modal";
import SettingsSideSheet from "@/components/user-profile-slide";
import type { Household } from "@/types/household";
import { router } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { IconButton, Surface, Text, useTheme } from "react-native-paper";

type UserHousehold = Household & {
  isOwner: boolean;
  status: "pending" | "active" | "left";
  isPaused: boolean;
};

export default function HouseholdsScreen() {
  const theme = useTheme();
  const [reauthVisible, setReauthVisible] = useState(false);
  const [, setDeleting] = useState(false);
  const initHouseholdsListener = useSetAtom(initHouseholdsListenerAtom);
  const households = useAtomValue(householdsAtom);
  const setCurrentHousehold = useSetAtom(currentHouseholdAtom);
  const getMemberByUserId = useSetAtom(getMemberByUserIdAtom);
  const user = useAtomValue(userAtom);
  const canEnter = (h: UserHousehold) => {
    if (h.isOwner) {
      return h.status === "active";
    }
    return h.status === "active" && !h.isPaused;
  };
  const visibleHouseholds = (households ?? [])
    .filter(
      (h: UserHousehold) => h.status === "active" || h.status === "pending",
    )
    .sort((a: UserHousehold, b: UserHousehold) => {
      const aInactive = a.status === "pending" || a.isPaused;
      const bInactive = b.status === "pending" || b.isPaused;

      return Number(aInactive) - Number(bInactive);
    });

  const setVisible = useSetAtom(slideVisibleAtom);
  const setShouldRender = useSetAtom(shouldRenderSlideAtom);
  const initPendingListener = useSetAtom(initPendingMembersListenerAtom);
  const pendingCounts = useAtomValue(pendingMembersCountAtom);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [alertHeadline, setAlertHeadline] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const ownerHouseholdIds = useMemo(() => {
    if (!households) return [];
    return households
      .filter(
        (h: UserHousehold) =>
          h.isOwner && (h.status === "active" || h.status === "pending"),
      )
      .map((h: UserHousehold) => h.id);
  }, [households]);

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
    if (ownerHouseholdIds.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    ownerHouseholdIds.forEach((householdId) => {
      const unsubscribe = initPendingListener(householdId);
      unsubscribers.push(unsubscribe);
    });

    // Cleanup all listeners when component unmounts or households change
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [ownerHouseholdIds, initPendingListener]);

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
      router.dismissTo("/(auth)/login");
    } catch (err: any) {
      setDeleting(false);
      Alert.alert(
        "Fel",
        err.message ?? "Något oväntat gick fel vid borttagning av kontot.",
      );
    }
  }

  async function handleSelectHousehold(h: UserHousehold) {
    if (user) {
      await getMemberByUserId({ householdId: h.id, userId: user.uid });
    }
    setCurrentHousehold(h);

    router.push("/(protected)/(top-tabs)/day-view");
  }

  function handleOpenSettings(h: UserHousehold) {
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
        <Text style={s.header}>Mina hushåll</Text>
        <IconButton icon="account" size={40} onPress={() => setVisible(true)} />
      </View>

      {households !== null && (
        <>
          <ScrollView style={s.householdContainer}>
            {visibleHouseholds.length === 0 ? (
              <NotFound
                title="Inga hushåll än."
                subTitle="Skapa ett nytt hushåll eller gå med i ett befintligt"
              />
            ) : (
              visibleHouseholds.map((h: UserHousehold) => {
                const pending = h.status === "pending";
                const paused = !!h.isPaused;
                const disabled = !canEnter(h);

                const suffix = pending
                  ? "Väntar på godkännande"
                  : paused
                    ? "Pausad"
                    : "";

                return (
                  <Pressable
                    key={h.id}
                    onPress={
                      disabled ? undefined : () => handleSelectHousehold(h)
                    }
                    disabled={disabled}
                    style={s.surfaceInner}
                  >
                    <Surface style={s.householdSurface} elevation={1}>
                      <View style={s.householdContent}>
                        <View style={s.textContainer}>
                          <Text
                            numberOfLines={1}
                            style={[
                              s.text,
                              (pending || paused) && {
                                color: theme.colors.onSurfaceDisabled,
                              },
                            ]}
                          >
                            {h.name}
                          </Text>
                          {suffix && (
                            <Text
                              style={[
                                s.suffix,
                                {
                                  color: theme.colors.onSurfaceDisabled,
                                },
                              ]}
                            >
                              {suffix}
                            </Text>
                          )}
                        </View>
                        {h.isOwner && pendingCounts[h.id] > 0 && (
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              handleOpenSettings(h);
                            }}
                            style={s.badge}
                          >
                            <Text style={s.badgeText}>
                              {pendingCounts[h.id]}
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    </Surface>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <View style={s.buttonContainer}>
            <CustomPaperButton
              mode="text"
              icon="home-plus"
              text="Skapa hushåll"
              onPress={() => router.push("/(protected)/create-household")}
            />
            <CustomPaperButton
              mode="contained"
              icon="account-multiple-plus"
              text="Gå med i hushåll"
              onPress={() => router.push("/(protected)/join-household")}
            />
          </View>
        </>
      )}
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
  },
  householdSurface: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 8,
  },
  householdContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 20,
    paddingLeft: 4,
    paddingRight: 4,
  },
  header: {
    fontSize: 35,
    paddingLeft: 4,
  },
  text: {
    fontSize: 20,
    flex: 1,
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 4,
  },
  suffix: {
    fontSize: 14,
    opacity: 0.8,
  },
  householdContainer: {
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  surfaceContent: {
    borderRadius: 10,
    overflow: "hidden",
  },
  surfaceInner: {
    paddingVertical: 8,
    paddingHorizontal: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  lottie: {
    width: 300,
    height: 300,
    alignSelf: "center",
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
