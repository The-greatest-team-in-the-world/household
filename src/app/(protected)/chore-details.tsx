import { selectedChoreAtom } from "@/atoms/chore-atom";
import { currentHouseholdMember } from "@/atoms/member-atom";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { useAtomValue } from "jotai";
import { StyleSheet, View } from "react-native";
import { Divider, Surface, Text } from "react-native-paper";

export default function ChoreDetailsScreen() {
  const selectedChore = useAtomValue(selectedChoreAtom);
  const currentUser = useAtomValue(currentHouseholdMember);

  const handlePressDone = () => {
    console.log("Markera som klar");
  };
  const handlePressDelete = () => {
    console.log("Ta bort syssla");
  };
  const handlePressEdit = () => {
    console.log("Redigera syssla");
  };

  return (
    <Surface style={s.container} elevation={4}>
      <View style={s.contentContainer}>
        <View style={s.choreNameContainer}>
          <Text style={s.choreName}>{selectedChore?.name}</Text>
          {currentUser?.isOwner && <Text style={s.choreName}>👑</Text>}
        </View>
        <Divider />
        <View style={s.secondContainer}>
          <Text style={s.text}>Beskrivning</Text>
          <Text style={s.textMedium}>{selectedChore?.description}</Text>
          <Divider />
          <Text style={s.text}>
            Återkommer var: {selectedChore?.frequency} dag
          </Text>
          <Divider />
          <Text style={s.text}>Värde: {selectedChore?.effort}</Text>
        </View>
      </View>
      <View style={s.buttonsContainer}>
        {currentUser?.isOwner && (
          <CustomPaperButton
            onPress={handlePressDone}
            text="Markera som klar"
            icon="check"
            color="#06BA63"
            style={{ minWidth: 220 }}
          />
        )}
        {currentUser?.isOwner && (
          <CustomPaperButton
            onPress={handlePressDelete}
            text="Ta bort syssla"
            icon="trash-can"
            color="#d03f3fff"
            style={{ minWidth: 220 }}
          />
        )}
        {currentUser?.isOwner && (
          <CustomPaperButton
            onPress={handlePressEdit}
            text="Redigera"
            icon="application-edit"
            color="#3179ffff"
            style={{ minWidth: 220 }}
          />
        )}
      </View>
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: "#e2e2e2ff",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: "space-between",
  },
  contentContainer: {
    flex: 1,
  },
  buttonsContainer: {
    alignItems: "center",
  },
  button: {
    minWidth: 200,
  },
  choreNameContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  secondContainer: {
    gap: 10,
    marginTop: 20,
  },
  choreName: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },
  textMedium: {
    fontSize: 24,
  },
  text: {
    fontSize: 18,
  },
});
