import { Chore } from "@/types/chore";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import { deleteCompletionsByChoreId } from "./chore-completions";

export type CreateChoreData = Partial<
  Omit<
    Chore,
    "id" | "createdAt" | "updatedAt" | "lastCompletedAt" | "lastCompletedBy"
  >
>;

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
        audioUrl: data.audioUrl ?? null,
        imageUrl: data.imageUrl ?? null,
        isArchived: data.isArchived,
        lastCompletedAt: data.lastCompletedAt ?? null,
        lastCompletedBy: data.lastCompletedBy ?? null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        assignedTo: data.assignedTo,
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
  data: Partial<
    Pick<
      Chore,
      | "name"
      | "description"
      | "frequency"
      | "effort"
      | "audioUrl"
      | "imageUrl"
      | "assignedTo"
    >
  >,
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

export async function deleteChorePermanently(
  householdId: string,
  choreId: string,
): Promise<void> {
  await deleteCompletionsByChoreId(householdId, choreId);

  const choreRef = doc(db, "households", householdId, "chores", choreId);
  await deleteDoc(choreRef);
}

export async function apiCreateChore(
  householdId: string,
  data: CreateChoreData,
): Promise<Chore> {
  const ref = collection(db, "households", householdId, "chores");

  const payload = {
    ...data,
    isArchived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastCompletedAt: null,
    lastCompletedBy: null,
  };

  const docRef = await addDoc(ref, payload);

  const newChore: Chore = {
    id: docRef.id,
    name: data.name ?? "",
    description: data.description ?? "",
    frequency: data.frequency ?? 1,
    effort: data.effort ?? 1,
    audioUrl: data.audioUrl ?? null,
    imageUrl: data.imageUrl ?? null,
    isArchived: false,
    lastCompletedAt: null,
    lastCompletedBy: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    assignedTo: data.assignedTo ?? null,
  };

  return newChore;
}
