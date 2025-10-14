import { StyleSheet, Text, View } from "react-native";
import { Card } from "react-native-paper";

interface Props {
  choreName: string;
  displayType: "avatar" | "days";
  displayValue: string;
}

export default function ChoreCard({
  choreName,
  displayType,
  displayValue,
}: Props) {
  return (
    <Card style={s.card}>
      <Card.Content style={s.cardContent}>
        <Text style={s.text}>{choreName}</Text>
        {displayType === "avatar" ? (
          <View style={s.avatarContainer}>
            <Text style={s.avatarEmoji}>{displayValue}</Text>
          </View>
        ) : (
          <View style={s.daysContainer}>
            <Text style={s.daysText}>{displayValue}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const s = StyleSheet.create({
  card: {
    marginBottom: 8,
    backgroundColor: "#ffffffff",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 15,
  },
  avatarContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEmoji: {
    fontSize: 16,
  },
  daysContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  daysText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
