import { mockdataAtom } from "@/providers/mockdata-provider";
import { useAtomValue } from "jotai";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function HouseholdsScreen() {
  const mockdata = useAtomValue(mockdataAtom);
  const households = mockdata.households;

  return (
    <View style={s.Container}>
      <View style={s.headerContainer}>
        <Text style={s.header}>Dina hushåll</Text>
      </View>
      <ScrollView style={s.householdContainer}>
        {households.map((household) => (
          <View key={household.id}>
            <Text style={s.text}>{household.name}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={s.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => console.log("Skapa nytt hushåll")}
        >
          Skapa nytt hushåll
        </Button>
        <Button
          mode="contained"
          onPress={() => console.log("Gå med i hushåll")}
        >Gå med i hushåll</Button>
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
  householdContainer: {
    padding: 20,
    gap: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  header: {
    fontSize: 45,
  },
  text: {
    fontSize: 15,
  },
});
