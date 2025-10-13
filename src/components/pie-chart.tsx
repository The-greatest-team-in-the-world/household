import { db } from "@/data/mock-db";
import { ChoreCompletion } from "@/types/chore-completion";
import getMemberAvatar from "@/utils/get-member-avatar";
import { StyleSheet, Text, View } from "react-native";
import PieChartRN, { Slice, SliceLabel } from "react-native-pie-chart";

interface Props {
  chores: ChoreCompletion[]; // array of completions for a single chore
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

    const choreId = chores[0].choreId;
    const chore = db.chores.find((c) => c.id === choreId);
    const perCompletionEffort = chore?.effort ?? 1;

    for (const completion of chores) {
      const memberId = completion.houseHoldMemberId;
      if (!effortPerUser[memberId]) effortPerUser[memberId] = 0;
      effortPerUser[memberId] += perCompletionEffort;
    }

    return effortPerUser;
  }

  const series: Slice[] = Object.entries(getEffortPerUser()).map(
    ([memberId, effort]) => {
      const avatar = getMemberAvatar(memberId);

      const color = avatar.color;
      const value = effort;
      const label: SliceLabel = { text: avatar.emoji };

      return { color, value, label };
    }
  );

  return (
    <View style={s.container}>
      <PieChartRN widthAndHeight={size} series={series} />
      <Text style={s.title}>
        {db.chores.find((c) => c.id === chores[0].choreId)?.name ?? "Chore"}
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
    fontWeight: 600,
  },
});
