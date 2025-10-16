import { getMemberByUserId, getMembers } from "@/api/members";
import { HouseholdMember } from "@/types/household-member";
import { atom } from "jotai";

export const currentHouseholdMember = atom<HouseholdMember | null>(null);
export const membersAtom = atom<HouseholdMember[]>([]);

export const getMembersAtom = atom(
  null,
  async (get, set, householdId: string) => {
    console.log("Fetching members for household:", householdId);
    const data = await getMembers(householdId);
    set(membersAtom, data);
    return data; // Returnera medlemmarna så att anroparen kan använda dem direkt
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
