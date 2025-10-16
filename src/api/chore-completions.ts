import { ChoreCompletion } from "@/types/chore-completion";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase-config";

export async function getAllCompletions(
  householdId: string,
): Promise<ChoreCompletion[]> {
  const completionsRef = collection(
    db,
    "households",
    householdId,
    "completions",
  );
  const snapshot = await getDocs(completionsRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ChoreCompletion[];
}

export async function addChoreCompletion(householdId: string, choreId: string) {
  const completionsRef = collection(
    db,
    "households",
    householdId,
    "completions",
  );
  await addDoc(completionsRef, {
    choreId: choreId,
    userId: auth.currentUser?.uid,
    completedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
