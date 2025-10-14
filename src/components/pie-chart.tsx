import { db } from "@/data/mock-db";
import { ChoreCompletion } from "@/types/chore-completion";
import getMemberAvatar from "@/utils/get-member-avatar";
import { StyleSheet, Text, View } from "react-native";
import PieChartRN, { Slice, SliceLabel } from "react-native-pie-chart";

interface Props {
  chores: ChoreCompletion[]; // array of completions for a single chore
  size: number;
  iconSize?: number;
  titleSize?: number;
  total?: boolean;
}

/**
 * Renders a pie-achrt for the specified chore.
 * @param chores May not contain chores with non matching ChoreIds without the use
 * of `total` parameter.
 * @param size Diameter of the pie-chart. Used for widthAndHeight property of
 * Piechart component.
 * @param total If this parameter is used, the Piechart will ignore the check for
 * multiple chores and instead render the total score for all chores with the title
 * set in "totalTitle".
 */
export default function PieChart({
  chores,
  size,
  iconSize,
  titleSize,
  total,
}: Props) {
  if (!chores || chores.length === 0) return null;

  if (!chores.every((c) => c.choreId === chores[0].choreId) && !total) {
    console.warn("Tried to render an array containing different chores.");
    return null;
  }

  const totalTitle = "Totalt";

  function getEffortPerUser() {
    const effortPerUser: Record<string, number> = {};

    const choreId = chores[0].choreId;
    const chore = db.chores.find((c) => c.id === choreId);
    const perCompletionEffort = chore?.effort ?? 1;

    for (const completion of chores) {
      const memberId = completion.userId;
      if (!effortPerUser[memberId]) effortPerUser[memberId] = 0;
      effortPerUser[memberId] += perCompletionEffort;
    }

    return effortPerUser;
  }

  const series: Slice[] = Object.entries(getEffortPerUser()).map(
    ([memberId, effort]) => {
      const avatar = getMemberAvatar([], memberId);

      const color = avatar.color;
      const value = effort;
      const label: SliceLabel = total
        ? { text: avatar.emoji, fontSize: iconSize ?? 24 }
        : { text: "" };

      return { color, value, label };
    }
  );

  return (
    <View style={s.container}>
      <PieChartRN widthAndHeight={size} series={series} />
      <Text style={[s.title, { fontSize: titleSize }]}>
        {total
          ? totalTitle
          : db.chores.find((c) => c.id === chores[0].choreId)?.name ?? "fel"}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "500",
  },
});
