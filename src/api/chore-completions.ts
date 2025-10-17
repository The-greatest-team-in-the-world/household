import { ChoreCompletion } from "@/types/chore-completion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";

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
