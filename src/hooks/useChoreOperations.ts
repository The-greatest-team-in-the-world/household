import {
  addChoreCompletion,
  deleteChoreCompletion,
  getAllCompletions,
} from "@/api/chore-completions";
import {
  apiCreateChore,
  archiveChore,
  CreateChoreData,
  deleteChorePermanently,
  updateChore,
} from "@/api/chores";
import { choresAtom, selectedChoreAtom } from "@/atoms/chore-atom";
import { choreCompletionsAtom } from "@/atoms/chore-completion-atom";
import { currentHouseholdMember } from "@/atoms/member-atom";
import { Chore } from "@/types/chore";
import { isChoreCompletedToday } from "@/utils/chore-helpers";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";

type UpdateChoreData = {
  name: string;
  description: string;
  frequency: number;
  effort: number;
};

export function useChoreOperations() {
  const selectedChore = useAtomValue(selectedChoreAtom);
  const currentMember = useAtomValue(currentHouseholdMember);
  const choreCompletions = useAtomValue(choreCompletionsAtom);
  const chores = useAtomValue(choresAtom);
  const setCompletions = useSetAtom(choreCompletionsAtom);
  const setSelectedChore = useSetAtom(selectedChoreAtom);
  const setChores = useSetAtom(choresAtom);

  const householdId = currentMember?.householdId || "";
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!selectedChore || !currentMember) return;

    const completed = isChoreCompletedToday(
      selectedChore.id,
      currentMember.userId,
      choreCompletions,
    );

    setIsCompleted(completed);
  }, [selectedChore, currentMember, choreCompletions]);

  const submitChoreCompletion = async (choreId: string) => {
    if (!currentMember) return;
    await addChoreCompletion(householdId, choreId);
    const updatedCompletions = await getAllCompletions(householdId);
    setCompletions(updatedCompletions);
  };
  const removeChoreCompletion = async (choreId: string) => {
    if (!currentMember) return;
    await deleteChoreCompletion(householdId, choreId, currentMember.userId);
    const updatedCompletions = await getAllCompletions(householdId);
    setCompletions(updatedCompletions);
  };

  const updateChoreData = async (data: UpdateChoreData) => {
    if (!selectedChore) return;

    await updateChore(householdId, selectedChore.id, {
      name: data.name,
      description: data.description,
      frequency: data.frequency,
      effort: data.effort,
    });

    const updatedChore: Chore = {
      ...selectedChore,
      name: data.name,
      description: data.description,
      frequency: data.frequency,
      effort: data.effort,
    };

    setSelectedChore(updatedChore);

    setChores(
      chores.map((chore) =>
        chore.id === selectedChore.id ? updatedChore : chore,
      ),
    );
  };

  const softDeleteChore = async () => {
    if (!selectedChore) return;

    await archiveChore(householdId, selectedChore!.id);
    setChores(chores.filter((chore) => chore.id !== selectedChore.id));
  };

  const deleteChore = async () => {
    if (!selectedChore) return;
    await deleteChorePermanently(householdId, selectedChore.id);
    setChores(chores.filter((chore) => chore.id !== selectedChore.id));
  };

  const createChore = async (data: CreateChoreData) => {
    if (!householdId) return;
    await apiCreateChore(householdId, data);
  };

  return {
    selectedChore,
    currentMember,
    householdId,
    isCompleted,
    submitChoreCompletion,
    removeChoreCompletion,
    updateChoreData,
    softDeleteChore,
    deleteChore,
    createChore,
  };
}
