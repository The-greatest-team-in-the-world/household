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
  startDate: Date;
  endDate: Date;
}

export default function PieChart({
  completedChores,
  chores,
  members,
  size,
  iconSize,
  titleSize,
  total,
  startDate,
  endDate,
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

  // Return null if no active completions (all users paused or no data)
  if (!activeCompletions || activeCompletions.length === 0) return null;

  const effortPerUser = getEffortPerUser(activeCompletions, chores);
  const normalizedEffortPerUser = normalizeDataForPeriod(
    effortPerUser,
    members,
    startDate,
    endDate,
  );

  const series: Slice[] = Object.entries(normalizedEffortPerUser).map(
    ([memberId, effort]) => {
      const avatar = getMemberAvatar(members, memberId);

      const color = avatar.color;
      const value = effort;
      const label: SliceLabel = {
        text: total ? avatar.emoji : "",
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

function getEffortPerUser(
  activeCompletions: ChoreCompletion[],
  chores: Chore[],
) {
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

function normalizeDataForPeriod(
  effortPerUser: Record<string, number>,
  members: HouseholdMember[],
  startDate: Date,
  endDate: Date,
) {
  const totalDays = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  const normalized: Record<string, number> = {};

  for (const [userId, effort] of Object.entries(effortPerUser)) {
    const member = members.find((m) => m.userId === userId);
    if (!member) continue;

    let pausedDays = 0;
    for (const period of member.pausePeriods ?? []) {
      if (!period.startDate) continue;

      const startPeriod = period.startDate.toDate();
      const endPeriod = period.endDate ? period.endDate.toDate() : new Date();
      startPeriod.setHours(0, 0, 0, 0);
      endPeriod.setHours(0, 0, 0, 0);

      const overlapStart = Math.max(startDate.getTime(), startPeriod.getTime());
      const overlapEnd = Math.min(endDate.getTime(), endPeriod.getTime());

      if (overlapStart < overlapEnd) {
        pausedDays += (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24);
      }
    }

    const activeDays = Math.max(1, totalDays - pausedDays);
    const multiplier = totalDays / activeDays;

    normalized[userId] = effort * multiplier;
  }

  return normalized;
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
