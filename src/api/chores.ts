import { Chore } from "@/types/chore";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";

export async function getChores(householdId: string): Promise<Chore[]> {
  const choresRef = collection(db, "households", householdId, "chores");
  const snapshot = await getDocs(choresRef);

  return snapshot.docs.map((doc) => {
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
  });
}
