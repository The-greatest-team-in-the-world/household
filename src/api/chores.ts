import { Chore } from "@/types/chore";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";

export async function getChores(householdId: string): Promise<Chore[]> {
  const choresRef = collection(db, "households", householdId, "chores");
  const snapshot = await getDocs(choresRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Chore[];
}
