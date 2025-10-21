import { Chore } from "@/types/chore";

export default function getChoreName(chores: Chore[], id: string) {
  const chore = chores.find((c) => c.id === id);

  if (!chore) {
    console.warn("Failed to get chore name.");
    return "fel";
  }

  return chore.name;
}
