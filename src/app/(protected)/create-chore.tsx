import ChoreForm, {
  ChoreFormData,
} from "@/components/chore-details/chore-form";
import { useChoreOperations } from "@/hooks/useChoreOperations";
import { router } from "expo-router";
import { useState } from "react";

export default function CreateChoreScreen() {
  const { createChore, householdId } = useChoreOperations();
  const [submitting, setSubmitting] = useState(false);

  const defaultValues: ChoreFormData = {
    name: "",
    description: "",
    frequency: 1,
    effort: 1,
  };

  const onSubmit = async (data: ChoreFormData) => {
    if (!householdId || submitting) return;
    setSubmitting(true);
    try {
      await createChore({
        name: data.name.trim(),
        description: (data.description ?? "").trim(),
        frequency: data.frequency,
        effort: data.effort,
      });
      router.replace("/(protected)/(top-tabs)/day-view");
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
    />
  );
}
