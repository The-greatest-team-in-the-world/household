import { CustomPaperButton } from "@/components/custom-paper-button";
import ChoreCard from "@/components/day-view/chore-card";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export default function DayViewScreen() {
  const { chores, completions, members, isLoading } = useHouseholdData(
    "household-team-greatest"
  );

  const getChoreName = (choreId: string): string => {
    const chore = chores.find((c) => c.id === choreId);
    return chore?.name || "Okänd syssla";
  };

  if (isLoading) {
    return (
      <View style={s.loading}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.headerContainer}>
        <Text style={s.header}>The Greatest Team Household</Text>
      </View>

      <ScrollView style={s.choreContainer}>
        {completions.map((completion) => (
          <ChoreCard
            key={completion.id}
            choreName={getChoreName(completion.choreId)}
            displayType="avatar"
            displayValue={"hej"}
          />
        ))}
      </ScrollView>

      <View style={s.buttonContainer}>
        <CustomPaperButton
          icon="information-outline"
          text="Mer info"
          color="#06BA63"
          onPress={() => console.log("Knapp tryckt")}
        />
        <CustomPaperButton
          icon="account-details-outline"
          text="Mina sysslor"
          color="#06BA63"
          onPress={() => console.log("Knapp tryckt")}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 10,
  },
  headerContainer: {
    alignItems: "center",
    padding: 20,
  },
  choreContainer: {
    padding: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    maxWidth: "100%",
  },
  header: {
    fontSize: 25,
  },
});
