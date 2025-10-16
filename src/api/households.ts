import { db } from "@/../firebase-config";
import { Household } from "@/types/household";
import { HouseholdMember } from "@/types/household-member";
import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export async function getUsersHouseholds(
  uid: string,
): Promise<(Household & { isOwner: boolean })[]> {
  const snap = await getDocs(
    query(collectionGroup(db, "members"), where("userId", "==", uid)),
  );

  if (snap.empty) return [];

  // Extrahera householdIds från member-data
  const membersByHouseholdId = new Map<string, HouseholdMember>();
  snap.docs.forEach((mdoc) => {
    const memberData = mdoc.data() as HouseholdMember;
    membersByHouseholdId.set(memberData.householdId, memberData);
  });

  // Hämta alla households
  const householdIds = Array.from(membersByHouseholdId.keys());
  const households = await Promise.all(
    householdIds.map(async (hId) => {
      const hsnap = await getDoc(doc(db, "households", hId));
      if (!hsnap.exists()) return null;

      const memberData = membersByHouseholdId.get(hId)!;
      return {
        id: hsnap.id,
        ...hsnap.data(),
        isOwner: memberData.isOwner,
      } as Household & { isOwner: boolean };
    }),
  );

  return households.filter(
    (h): h is Household & { isOwner: boolean } => h !== null,
  );
}
