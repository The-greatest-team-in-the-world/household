import { currentHouseholdAtom } from "@/atoms/household-atom";
import {
  initPendingMembersListenerAtom,
  pendingMembersCountAtom,
} from "@/atoms/member-atom";
import { useRouter } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";

export function HouseholdHeader() {
  const router = useRouter();
  const currentHousehold = useAtomValue(currentHouseholdAtom);
  const pendingCounts = useAtomValue(pendingMembersCountAtom);
  const initPendingListener = useSetAtom(initPendingMembersListenerAtom);

  useEffect(() => {
    if (!currentHousehold || !currentHousehold.isOwner) return;

    const unsubscribe = initPendingListener(currentHousehold.id);
    return () => unsubscribe();
  }, [currentHousehold, initPendingListener]);

  const handleOpenSettings = () => {
    router.push("/(protected)/household-details");
  };

  const pendingCount = currentHousehold
    ? pendingCounts[currentHousehold.id] || 0
    : 0;

  return (
    <View style={styles.container}>
      {currentHousehold?.isOwner && pendingCount > 0 && (
        <Pressable style={styles.badge} onPress={handleOpenSettings}>
          <Text style={styles.badgeText}>{pendingCount}</Text>
        </Pressable>
      )}
      <IconButton
        icon={currentHousehold?.isOwner ? "cog" : "information"}
        size={24}
        onPress={handleOpenSettings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    marginRight: 4,
  },
  badge: {
    backgroundColor: "#f44336",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 6,
  },
});
