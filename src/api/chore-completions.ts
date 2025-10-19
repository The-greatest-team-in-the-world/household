import { ChoreCompletion } from "@/types/chore-completion";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
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

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      choreId: data.choreId,
      userId: data.userId,
      completedAt: data.completedAt,
    } as ChoreCompletion;
  });
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
    updatedAt: serverTimestamp(),
  });
}

export async function deleteChoreCompletion(
  householdId: string,
  choreId: string,
  userId: string,
) {
  const completionsRef = collection(
    db,
    "households",
    householdId,
    "completions",
  );

  // Hämta dagens datum
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Hämta alla completions
  const snapshot = await getDocs(completionsRef);

  // Hitta completion som matchar choreId, userId och är från idag
  const completionToDelete = snapshot.docs.find((doc) => {
    const data = doc.data();
    const completionDate = data.completedAt.toDate();
    completionDate.setHours(0, 0, 0, 0);

    return (
      data.choreId === choreId &&
      data.userId === userId &&
      completionDate.getTime() === today.getTime()
    );
  });

  // Ta bort completion om den hittas
  if (completionToDelete) {
    await deleteDoc(
      doc(db, "households", householdId, "completions", completionToDelete.id),
    );
  }
}
