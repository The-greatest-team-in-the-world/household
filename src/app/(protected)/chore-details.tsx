import { selectedChoreAtom } from "@/atoms/chore-atom";
import { currentHouseholdMember } from "@/atoms/member-atom";
import { useAtomValue } from "jotai";
import { StyleSheet } from "react-native";
import { Divider, Surface, Text } from "react-native-paper";

export default function ChoreDetailsScreen() {
  const selectedChore = useAtomValue(selectedChoreAtom);
  const currentUser = useAtomValue(currentHouseholdMember);
  console.log("is Owner:", currentUser?.isOwner);

  return (
    <Surface style={s.container} elevation={4}>
      <Text style={s.choreName}>{selectedChore?.name}</Text>
      <Divider />
      <Text>Beskrivning</Text>
      <Text style={s.choreDescription}>{selectedChore?.description}</Text>
      <Text>{selectedChore?.frequency}</Text>
      <Text>{selectedChore?.effort}</Text>
      {currentUser?.isOwner && (
        <Surface style={s.container} elevation={4}>
          <Text>Jag är Owner</Text>
        </Surface>
      )}
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: "#e2e2e2ff",
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  choreName: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  choreDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
});
