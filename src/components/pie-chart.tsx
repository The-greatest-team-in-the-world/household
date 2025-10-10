import { ChoreCompletion } from "@/types/chore-completion";
import getMemberAvatar from "@/utils/get-member-avatar";
import { StyleSheet, Text, View } from "react-native";
import PieChartRN, { Slice, SliceLabel } from "react-native-pie-chart";

interface Props {
  chores: ChoreCompletion[];
  size: number;
  total?: boolean;
}

/**
 * Renders a pie-achrt for the specified chore.
 * @param chores May not contain chores with non matching ChoreIds without the use
 * of `total` parameter.
 * @param size Diameter of the pie-chart.
 * @param total If this parameter is used, the Piechart will ignore the check for
 * multiple chores and instead render the total score for all chores with the title
 * set in "totalTitle". 
 */
export default function PieChart({ chores, size, total }: Props) {
  if (!chores || chores.length === 0) return null;

  if (!chores.every((c) => c.choreId === chores[0].choreId) && !total) {
    console.warn("Tried to render an array containing different chores.");
    return null;
  }

  const totalTitle = "Totalt";

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
      const avatar = getMemberAvatar(userId);

      const color = avatar.color;
      const value = effort;
      const label: SliceLabel = { text: avatar.emoji };

      return { color, value, label };
    },
  );

  return (
    <View style={s.container}>
      <PieChartRN widthAndHeight={size} series={series} />
      <Text style={s.title}>
        {total ? totalTitle : chores[0].choreName}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    margin: 10,
    fontWeight: "600",
  },
});
