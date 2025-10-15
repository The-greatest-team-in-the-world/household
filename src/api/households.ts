import { db } from "@/../firebase-config";
import { Household } from "@/types/household";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function getUsersHouseholds(uid: string): Promise<Household[]> {
  const householdsRef = collection(db, "households");

  const q = query(householdsRef, where("ownerIds", "array-contains", uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Household,
  );
}
