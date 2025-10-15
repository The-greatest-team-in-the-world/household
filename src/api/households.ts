import { db } from "@/../firebase-config";
import { Household } from "@/types/household";
import { HouseholdMember } from "@/types/household-member";
import {
  collectionGroup,
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

  const households = await Promise.all(
    snap.docs.map(async (mdoc) => {
      const memberData = mdoc.data() as HouseholdMember;
      const householdRef = mdoc.ref.parent.parent;
      if (!householdRef) return null;
      const hsnap = await getDoc(householdRef);
      return hsnap.exists()
        ? ({
            id: hsnap.id,
            ...hsnap.data(),
            isOwner: memberData.isOwner,
          } as Household & { isOwner: boolean })
        : null;
    }),
  );

  return households.filter(
    (h): h is Household & { isOwner: boolean } => h !== null,
  );
}
