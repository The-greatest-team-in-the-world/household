import { getChores } from "@/api/chores";
import { currentHouseholdMember } from "@/atoms/member-atom";
import { Chore } from "@/types/chore";
import { atom } from "jotai";

export const selectedChoreAtom = atom<Chore | null>(null);
export const choresAtom = atom<Chore[]>([]);

export const loadChoresAtom = atom(
  null,
  async (get, set, householdId: string) => {
    if (!householdId) {
      set(choresAtom, []);
      return;
    }

    const chores = await getChores(householdId);
    set(choresAtom, chores);
  },
);

export const myChoresAtom = atom((get) => {
  const chores = get(choresAtom);
  const me = get(currentHouseholdMember);

  if (!me) return [];

  return chores.filter(
    (chore) =>
      Array.isArray(chore.assignedTo) && chore.assignedTo.includes(me.userId),
  );
});
