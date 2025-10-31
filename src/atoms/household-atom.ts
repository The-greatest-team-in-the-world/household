import { getUsersHouseholds, initHouseholdsListener } from "@/api/households";
import { Household } from "@/types/household";
import { atom } from "jotai";
import { userAtom } from "./auth-atoms";

export const currentHouseholdAtom = atom<
  | (Household & {
      isOwner: boolean;
      status: "pending" | "active" | "left";
      isPaused: boolean;
    })
  | null
>(null);

export const getUsersHouseholdsAtom = atom(null, async (get, set) => {
  const user = get(userAtom);
  if (!user) return;

  console.log("Fetching households for user:", user.uid);
  const data = await getUsersHouseholds(user.uid);
  set(householdsAtom, data.length > 0 ? data : null);
});

export const householdsAtom = atom<
  | (Household & {
      isOwner: boolean;
      status: "pending" | "active" | "left";
      isPaused: boolean;
    })[]
  | null
>(null);

export const resetHouseholdAtomsAtom = atom(null, (get, set) => {
  set(currentHouseholdAtom, null);
  set(householdsAtom, null);
});

export const initHouseholdsListenerAtom = atom(
  null,
  (get, set, userId: string) => {
    return initHouseholdsListener(userId, (households) => {
      set(householdsAtom, households);

      const currentHousehold = get(currentHouseholdAtom);
      if (currentHousehold && households) {
        const updatedHousehold = households.find(
          (h) => h.id === currentHousehold.id,
        );
        if (updatedHousehold) {
          set(currentHouseholdAtom, updatedHousehold);
        }
      }
    });
  },
);
