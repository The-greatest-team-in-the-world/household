import { currentHouseholdAtom } from "@/atoms/household-atom";
import {
  initPendingMembersListenerAtom,
  pendingMembersCountAtom,
} from "@/atoms/member-atom";
import { useRouter } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Badge, IconButton } from "react-native-paper";

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
      <View>
        <IconButton
          icon={currentHousehold?.isOwner ? "cog" : "information"}
          size={24}
          onPress={handleOpenSettings}
        />
        {currentHousehold?.isOwner && pendingCount > 0 && (
          <Badge style={styles.badge}>{pendingCount}</Badge>
        )}
      </View>
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
    position: "absolute",
    top: 4,
    right: 4,
  },
});
