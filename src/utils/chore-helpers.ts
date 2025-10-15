import { Chore } from "@/types/chore";
import { ChoreCompletion } from "@/types/chore-completion";
import { Timestamp } from "firebase/firestore";

/**
 * Kollar om en chore är gjord baserat på frekvens och senaste completion
 */
export function isChoreCompleted(
  chore: Chore,
  completions: ChoreCompletion[],
): boolean {
  if (completions.length === 0) {
    return false;
  }

  const latestCompletion = completions.reduce((latest, current) => {
    return current.completedAt.toMillis() > latest.completedAt.toMillis()
      ? current
      : latest;
  });

  if (chore.frequency === null) {
    return true;
  }

  const now = Timestamp.now();
  const daysSinceCompletion =
    (now.toMillis() - latestCompletion.completedAt.toMillis()) /
    (1000 * 60 * 60 * 24);

  return daysSinceCompletion < chore.frequency;
}

/**
 * Beräknar hur många dagar sedan en chore senast gjordes
 */
export function getDaysSinceLastCompletion(
  chore: Chore,
  completions: ChoreCompletion[],
): number {
  if (completions.length === 0) {
    const daysSinceCreated =
      (Timestamp.now().toMillis() - chore.createdAt.toMillis()) /
      (1000 * 60 * 60 * 24);
    return Math.floor(daysSinceCreated);
  }

  const latestCompletion = completions.reduce((latest, current) => {
    return current.completedAt.toMillis() > latest.completedAt.toMillis()
      ? current
      : latest;
  });

  const daysSince =
    (Timestamp.now().toMillis() - latestCompletion.completedAt.toMillis()) /
    (1000 * 60 * 60 * 24);

  return Math.floor(daysSince);
}

/**
 * Beräknar hur många dagar försenad en chore är
 */
export function getDaysOverdue(
  chore: Chore,
  completions: ChoreCompletion[],
): number {
  if (chore.frequency === null || completions.length === 0) {
    return 0;
  }

  const latestCompletion = completions.reduce((latest, current) => {
    return current.completedAt.toMillis() > latest.completedAt.toMillis()
      ? current
      : latest;
  });

  const deadline =
    latestCompletion.completedAt.toMillis() +
    chore.frequency * 24 * 60 * 60 * 1000;

  const daysDiff =
    (Timestamp.now().toMillis() - deadline) / (1000 * 60 * 60 * 24);

  return Math.max(0, Math.floor(daysDiff));
}
