import { Chore } from "@/types/chore";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";

export async function getChores(householdId: string): Promise<Chore[]> {
  const choresRef = collection(db, "households", householdId, "chores");
  const snapshot = await getDocs(choresRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Chore[];
}

export async function getChoreById(
  householdId: string,
  choreId: string,
): Promise<Chore | null> {
  const choreRef = doc(db, "households", householdId, "chores", choreId);
  const snapshot = await getDoc(choreRef);

  if (snapshot.exists()) {
    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Chore;
  }

  return null;
}
