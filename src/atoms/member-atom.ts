import { getMemberByUserId, getMembers } from "@/api/members";
import { HouseholdMember } from "@/types/household-member";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { atom } from "jotai";
import { db } from "../../firebase-config";

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
    console.log("Setting up pending members listener for:", householdId);

    const membersRef = collection(db, "households", householdId, "members");
    const q = query(membersRef, where("status", "==", "pending"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const currentCounts = get(pendingMembersCountAtom);
      const newCounts = {
        ...currentCounts,
        [householdId]: snapshot.size,
      };
      set(pendingMembersCountAtom, newCounts);
      console.log(
        `Pending members count updated for ${householdId}:`,
        snapshot.size,
      );
    });

    return unsubscribe;
  },
);

export const initMembersListenerAtom = atom(
  null,
  (get, set, householdId: string) => {
    console.log("Setting up members listener for:", householdId);

    const membersRef = collection(db, "households", householdId, "members");

    const unsubscribe = onSnapshot(membersRef, (snapshot) => {
      const members = snapshot.docs.map((doc) => doc.data() as HouseholdMember);
      set(membersAtom, members);
      console.log(`Members updated for ${householdId}:`, members.length);
    });

    return unsubscribe;
  },
);
