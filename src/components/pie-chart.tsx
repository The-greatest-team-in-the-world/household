import useMemberAvatar from "@/hooks/use-member-avatar";
import { ChoreCompletion } from "@/types/chore-completion";
import { StyleSheet, Text, View } from "react-native";
import PieChartRN, { Slice, SliceLabel } from "react-native-pie-chart";

interface Props {
  chores: ChoreCompletion[];
  size: number;
}

/**
 * Renders a pie-achrt for the specified chore.
 * @param chores Cannot contain chores with non matching ChoreIds.
 * @param size Diameter of the pie-chart.
 */
export default function PieChart({ chores, size }: Props) {
  if (!chores || chores.length === 0) return null;

  if (!chores.every((c) => c.choreId === chores[0].choreId)) {
    console.warn("Tried to render an array containing different chores.");
    return null;
  }

  function getEffortPerUser() {
    const effortPerUser: Record<string, number> = {};

    for (const chore of chores) {
      if (!effortPerUser[chore.userId]) {
        effortPerUser[chore.userId] = 0;
      }

      effortPerUser[chore.userId] += chore.choreEffort;
    }

    return effortPerUser;
  }

  const series: Slice[] = Object.entries(getEffortPerUser()).map(
    ([userId, effort]) => {
      const avatar = useMemberAvatar(userId);

      const color = avatar.color;
      const value = effort;
      const label: SliceLabel = { text: avatar.emoji };

      return { color, value, label };
    },
  );

  return (
    <View style={s.container}>
      <PieChartRN widthAndHeight={size} series={series} />
      <Text style={s.title}>{chores[0].choreName}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    margin: 10,
    fontWeight: 600,
  },
});
