import { mockdataAtom } from "@/providers/mockdata-provider";
import { useAtomValue } from "jotai";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Divider } from "react-native-paper";

// Läs in rätt household (id) via atom?

// Om chore är klar, hitta vilken user och hitta avatar och skriv ut den
// Om chore inte är klar skriv ut hur många dagar sedan sysslan gjordes senast samt om den är försenad.

// När en användare väljer en syssla ska beskrivningen av sysslan visas och det ska även med ett enkelt tryck gå att markera sysslan som gjord.

export default function DayViewScreen() {
  const mockdata = useAtomValue(mockdataAtom);
  const household = mockdata.households[0]; //hårdkodat till första hushållet, ta in via atom?

  const todayChores = household.chores || [];

  return (
    <View style={s.Container}>
      <View style={s.headerContainer}>
        <Text style={s.header}>{household.name}</Text>
      </View>
      <ScrollView style={s.choreContainer}>
        {todayChores.map((chore) => (
          <View key={chore.id}>
            <Text style={s.text}>{chore.name}</Text>
            <Divider horizontalInset={false} bold={true} />
          </View>
        ))}
      </ScrollView>

      <View style={s.buttonContainer}>
        <Button
          icon="format-list-group-plus"
          mode="contained"
          onPress={() => console.log("Lägg till Pressed")}
        >
          Lägg till
        </Button>
        <Button
          icon="lead-pencil"
          mode="contained"
          onPress={() => console.log("ändra Pressed")}
        >
          Ändra
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
    padding: 20,
  },
  choreContainer: {
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
