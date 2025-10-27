import { Chore } from "@/types/chore";
import { ChoreCompletion } from "@/types/chore-completion";
import { HouseholdMember } from "@/types/household-member";
import GetChoreName from "@/utils/get-chore-name";
import getMemberAvatar from "@/utils/get-member-avatar";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import PieChartRN, { Slice, SliceLabel } from "react-native-pie-chart";

interface Props {
  completedChores: ChoreCompletion[];
  chores: Chore[];
  members: HouseholdMember[];
  size: number;
  iconSize?: number;
  titleSize?: number;
  total?: boolean;
}

export default function PieChart({
  completedChores,
  chores,
  members,
  size,
  iconSize,
  titleSize,
  total,
}: Props) {
  if (!completedChores || completedChores.length === 0) return null;

  if (
    !completedChores.every((c) => c.choreId === completedChores[0].choreId) &&
    !total
  ) {
    console.warn("Tried to render an array containing different chores.");
    return null;
  }

  const totalTitle = "Totalt";
  const activeCompletions = omitPausedUsers(completedChores, members);

  function getEffortPerUser() {
    const effortPerUser: Record<string, number> = {};

    const choreId = activeCompletions[0].choreId;
    const chore = chores.find((c) => c.id === choreId);
    const perCompletionEffort = chore?.effort ?? 1;

    for (const completion of activeCompletions) {
      const memberId = completion.userId;
      if (!effortPerUser[memberId]) effortPerUser[memberId] = 0;
      effortPerUser[memberId] += perCompletionEffort;
    }

    return effortPerUser;
  }

  const series: Slice[] = Object.entries(getEffortPerUser()).map(
    ([memberId, effort]) => {
      const avatar = getMemberAvatar(members, memberId);

      const color = avatar.color;
      const value = effort;
      const label: SliceLabel = {
        text: !total ? avatar.emoji : "",
        fontSize: iconSize ?? 24,
      };

      return { color, value, label };
    },
  );

  return (
    <View style={s.container}>
      <PieChartRN widthAndHeight={size} series={series} />
      <Text style={[s.title, { fontSize: titleSize }]}>
        {total
          ? totalTitle
          : GetChoreName(chores, activeCompletions[0].choreId)}
      </Text>
    </View>
  );
}

function omitPausedUsers(
  completions: ChoreCompletion[],
  members: HouseholdMember[],
) {
  const sortedCompletedChores = completions.filter((cC) => {
    const member = members.find((m) => m.userId === cC.userId);
    return member && !member.isPaused;
  });

  return sortedCompletedChores;
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
