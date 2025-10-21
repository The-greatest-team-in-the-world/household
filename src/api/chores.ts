import { Chore } from "@/types/chore";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase-config";

export async function getChores(householdId: string): Promise<Chore[]> {
  const choresRef = collection(db, "households", householdId, "chores");
  const snapshot = await getDocs(choresRef);

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        effort: data.effort,
        audioUrl: data.audioUrl,
        imageUrl: data.imageUrl,
        isArchived: data.isArchived,
        lastCompletedAt: data.lastCompletedAt,
        lastCompletedBy: data.lastCompletedBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as Chore;
    })
    .filter((chore) => !chore.isArchived);
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

export async function updateChore(
  householdId: string,
  choreId: string,
  data: Partial<Pick<Chore, "name" | "description" | "frequency" | "effort">>,
): Promise<void> {
  const choreRef = doc(db, "households", householdId, "chores", choreId);
  await updateDoc(choreRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function archiveChore(
  householdId: string,
  choreId: string,
): Promise<void> {
  const choreRef = doc(db, "households", householdId, "chores", choreId);
  await updateDoc(choreRef, {
    isArchived: true,
    updatedAt: Timestamp.now(),
  });
}
