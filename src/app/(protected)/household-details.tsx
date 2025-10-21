import { getMembers } from "@/api/members";
import { currentHouseholdAtom } from "@/atoms/household-atom";
import { membersAtom } from "@/atoms/member-atom";
import { MemberList } from "@/components/member-list";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export default function HouseHoldDetailsScreen() {
  const currentHousehold = useAtomValue(currentHouseholdAtom);
  const setMembers = useSetAtom(membersAtom);
  const members = useAtomValue(membersAtom);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      if (!currentHousehold?.id) return;

      setLoading(true);
      try {
        const fetchedMembers = await getMembers(currentHousehold.id);
        setMembers(fetchedMembers);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [currentHousehold?.id, setMembers]);

  if (!currentHousehold) {
    return (
      <View style={styles.centerContainer}>
        <Text>No household selected</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Check isOwner from currentHousehold (which includes isOwner from getUsersHouseholds)
  const isOwner = currentHousehold?.isOwner ?? false;

  console.log("Current household:", currentHousehold);
  console.log("Is owner:", isOwner);

  return (
    <ScrollView style={styles.container}>
      {isOwner ? (
        <View style={styles.centerContainer}>
          <Text variant="headlineMedium">Admin View</Text>
          <Text>Owner view - Admin controls coming soon</Text>
        </View>
      ) : (
        <MemberList
          members={members}
          householdName={currentHousehold.name}
          householdCode={currentHousehold.code}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
