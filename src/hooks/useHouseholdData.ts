import { getAllCompletions } from "@/api/chore-completions";
import { getChores } from "@/api/chores";
import { getMembers } from "@/api/members";
import { choresAtom } from "@/atoms/chore-atom";
import { choreCompletionsAtom } from "@/atoms/chore-completion-atom";
import { membersAtom } from "@/atoms/member-atom";
import { isChoreCompleted } from "@/utils/chore-helpers";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";

export function useHouseholdData(householdId: string) {
  const setChores = useSetAtom(choresAtom);
  const setCompletions = useSetAtom(choreCompletionsAtom);
  const setMembers = useSetAtom(membersAtom);

  const chores = useAtomValue(choresAtom);
  const completions = useAtomValue(choreCompletionsAtom);
  const members = useAtomValue(membersAtom);

  useEffect(() => {
    async function fetchHouseholdData() {
      try {
        const [choresData, completionsData, membersData] = await Promise.all([
          getChores(householdId),
          getAllCompletions(householdId),
          getMembers(householdId),
        ]);

        setChores(choresData);
        setCompletions(completionsData);
        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching household data:", error);
      }
    }

    if (householdId) {
      fetchHouseholdData();
    }
  }, [householdId, setChores, setCompletions, setMembers]);

  const incompleteChores = useMemo(() => {
    return chores.filter((chore) => {
      const choreCompletions = completions.filter(
        (c) => c.choreId === chore.id,
      );
      return !isChoreCompleted(chore, choreCompletions);
    });
  }, [chores, completions]);

  return {
    chores,
    incompleteChores,
    completions,
    members,
    isLoading:
      chores.length === 0 && completions.length === 0 && members.length === 0,
  };
}
