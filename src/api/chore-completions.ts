import { ChoreCompletion } from "@/types/chore-completion";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
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

export async function deleteCompletionsByChoreId(
  householdId: string,
  choreId: string,
): Promise<void> {
  const completionsRef = collection(
    db,
    "households",
    householdId,
    "completions",
  );
  const queryByChoreId = query(completionsRef, where("choreId", "==", choreId));
  const snapshot = await getDocs(queryByChoreId);

  console.log("🔍 Searching for completions with choreId:", choreId);
  console.log("Found", snapshot.size, "matching completions");

  const deletionPromises = snapshot.docs.map((completionDoc) =>
    deleteDoc(completionDoc.ref),
  );

  await Promise.all(deletionPromises);
}

export async function addChoreCompletion(householdId: string, choreId: string) {
  const userId = auth.currentUser?.uid;

  const completionsRef = collection(
    db,
    "households",
    householdId,
    "completions",
  );
  await addDoc(completionsRef, {
    choreId: choreId,
    userId: userId,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const choreRef = doc(db, "households", householdId, "chores", choreId);
  await updateDoc(choreRef, {
    lastCompletedAt: Timestamp.now(),
    lastCompletedBy: userId,
    updatedAt: Timestamp.now(),
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

    // Hitta den senaste kvarvarande completionen för denna chore
    const remainingCompletions = snapshot.docs
      .filter((doc) => {
        const data = doc.data();
        return data.choreId === choreId && doc.id !== completionToDelete.id;
      })
      .map((doc) => doc.data());

    // Uppdatera chore med den senaste completionen eller null
    const choreRef = doc(db, "households", householdId, "chores", choreId);

    if (remainingCompletions.length > 0) {
      // Hitta den senaste completionen
      const latestCompletion = remainingCompletions.reduce(
        (latest, current) => {
          return current.completedAt.toMillis() > latest.completedAt.toMillis()
            ? current
            : latest;
        },
      );

      await updateDoc(choreRef, {
        lastCompletedAt: latestCompletion.completedAt,
        lastCompletedBy: latestCompletion.userId,
        updatedAt: Timestamp.now(),
      });
    } else {
      // Inga completions kvar, sätt till null
      await updateDoc(choreRef, {
        lastCompletedAt: null,
        lastCompletedBy: null,
        updatedAt: Timestamp.now(),
      });
    }
  }
}
