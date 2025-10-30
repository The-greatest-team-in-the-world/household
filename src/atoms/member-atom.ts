import {
  getMemberByUserId,
  getMembers,
  initMembersListener,
  initPendingMembersListener,
} from "@/api/members";
import { HouseholdMember } from "@/types/household-member";
import { atom } from "jotai";

export const currentHouseholdMember = atom<HouseholdMember | null>(null);
export const membersAtom = atom<HouseholdMember[]>([]);
export const pendingMembersCountAtom = atom<Record<string, number>>({});

export const getMembersAtom = atom(
  null,
  async (get, set, householdId: string) => {
    console.log("Fetching members for household:", householdId);
    const data = await getMembers(householdId);
    set(membersAtom, data);
    return data;
  },
);

export const getMemberByUserIdAtom = atom(
  null,
  async (get, set, params: { householdId: string; userId: string }) => {
    console.log(
      "Fetching member for household:",
      params.householdId,
      "userId:",
      params.userId,
    );
    const member = await getMemberByUserId(params.householdId, params.userId);
    if (member) {
      set(currentHouseholdMember, member);
    }
    return member;
  },
);

export const initPendingMembersListenerAtom = atom(
  null,
  (get, set, householdId: string) => {
    return initPendingMembersListener(householdId, (count) => {
      const currentCounts = get(pendingMembersCountAtom);
      const newCounts = {
        ...currentCounts,
        [householdId]: count,
      };
      set(pendingMembersCountAtom, newCounts);
    });
  },
);

export const initMembersListenerAtom = atom(
  null,
  (_get, set, householdId: string) => {
    return initMembersListener(householdId, (members) => {
      set(membersAtom, members);
    });
  },
);

export const resetMemberAtomsAtom = atom(null, (get, set) => {
  set(currentHouseholdMember, null);
  set(membersAtom, []);
  set(pendingMembersCountAtom, {});
});
