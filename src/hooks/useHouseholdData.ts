import { getAllCompletions } from "@/api/chore-completions";
import { getChores } from "@/api/chores";
import { getMembers } from "@/api/members";
import { choresAtom } from "@/atoms/chore-atom";
import { choreCompletions } from "@/atoms/chore-completion-atom";
import { membersAtom } from "@/atoms/member-atom";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

export function useHouseholdData(householdId: string) {
  const setChores = useSetAtom(choresAtom);
  const setCompletions = useSetAtom(choreCompletions);
  const setMembers = useSetAtom(membersAtom);

  const chores = useAtomValue(choresAtom);
  const completions = useAtomValue(choreCompletions);
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

  return {
    chores,
    completions,
    members,
    isLoading:
      chores.length === 0 && completions.length === 0 && members.length === 0,
  };
}
