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
  name?: string;
  description?: string;
  frequency?: number;
  effort?: number;
  audioUrl?: string | null;
  imageUrl?: string | null;
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

  //TODO kan vi tar bort denna useEffect? //LAX
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

    // Uppdatera bara de fält som finns i data
    await updateChore(householdId, selectedChore.id, data);

    // Mergea nya data med befintlig chore
    const updatedChore: Chore = {
      ...selectedChore,
      ...data,
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

    const newChore = await apiCreateChore(householdId, data);

    setChores([...chores, newChore]);
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
