import { getUsersHouseholds } from "@/api/households";
import { Household } from "@/types/household";
import { atom } from "jotai";
import { userAtom } from "./auth-atoms";

export const currentHouseholdAtom = atom<
  (Household & { isOwner: boolean }) | null
>(null);

export const getUsersHouseholdsAtom = atom(null, async (get, set) => {
  const user = get(userAtom);
  if (!user) return;

  console.log("Fetching households for user:", user.uid);
  const data = await getUsersHouseholds(user.uid);
  set(householdsAtom, data.length > 0 ? data : null);
});

export const householdsAtom = atom<(Household & { isOwner: boolean })[] | null>(
  null,
);
