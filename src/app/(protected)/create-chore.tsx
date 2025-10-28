import { selectedChoreAtom } from "@/atoms/chore-atom";
import { currentHouseholdAtom } from "@/atoms/household-atom";
import { getMembersAtom, membersAtom } from "@/atoms/member-atom";
import ChoreForm, {
  ChoreFormData,
} from "@/components/chore-details/chore-form";
import { useChoreOperations } from "@/hooks/useChoreOperations";
import { router } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";

export default function CreateChoreScreen() {
  const setSelectedChore = useSetAtom(selectedChoreAtom);
  const { createChore, householdId } = useChoreOperations();
  const members = useAtomValue(membersAtom);
  const currentHousehold = useAtomValue(currentHouseholdAtom);
  const loadMembers = useSetAtom(getMembersAtom);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const idToUse = householdId ?? currentHousehold?.id;
    if (!idToUse) return;

    loadMembers(idToUse);
  }, [householdId, currentHousehold, loadMembers]);

  const defaultValues: ChoreFormData = {
    name: "",
    description: "",
    frequency: 1,
    effort: 1,
    assignedTo: null,
  };

  const onSubmit = async (data: ChoreFormData) => {
    if (!householdId || submitting) return;
    setSubmitting(true);
        try {
      const assignedArray: string[] = data.assignedTo
        ? [data.assignedTo]
        : []; 
     const newChore = await createChore({
        name: data.name.trim(),
        description: (data.description ?? "").trim(),
        frequency: data.frequency,
        effort: data.effort,
        assignedTo: assignedArray,
      })

      if (newChore) {
        setSelectedChore(newChore);
        router.replace("/chore-details");
      } else {
        router.back();
      }
    } catch (e) {
      console.error("createChore failed:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ChoreForm
      title="Skapa ny syssla"
      defaultValues={defaultValues}
      isSubmitting={submitting}
      onSubmit={onSubmit}
      onCancel={() => router.back()}
      showDelete={false}
      mode="onBlur"
      isCreating={true}
      members={members}
    />
  );
}
