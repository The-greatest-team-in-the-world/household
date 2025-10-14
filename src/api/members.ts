import { HouseholdMember } from "@/types/household-member";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";

export async function getMembers(
  householdId: string
): Promise<HouseholdMember[]> {
  const membersRef = collection(db, "households", householdId, "members");
  const snapshot = await getDocs(membersRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as HouseholdMember[];
}

export async function getAllMembers() {
  const householdsRef = collection(db, "households");
  const snapshot = await getDocs(householdsRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as HouseholdMember[];
}
