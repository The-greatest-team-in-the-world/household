import { StyleSheet } from "react-native";
import { Surface, Text } from "react-native-paper";

interface HouseholdInfoHeaderProps {
  householdName: string;
  householdCode: string;
}

export function HouseholdInfoHeader({
  householdName,
  householdCode,
}: HouseholdInfoHeaderProps) {
  return (
    <Surface style={styles.card} elevation={1}>
      <Text variant="headlineMedium" style={styles.householdName}>
        {householdName}
      </Text>
      <Text variant="bodyMedium" style={styles.code}>
        Hushållskod: {householdCode}
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 12,
  },
  householdName: {
    textAlign: "center",
    marginBottom: 4,
  },
  code: {
    textAlign: "center",
    marginBottom: 8,
    opacity: 0.7,
  },
});
