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
 * Räknar kalenderdagar, inte 24-timmarsperioder
 */
export function getDaysSinceLastCompletion(
  chore: Chore,
  completions: ChoreCompletion[],
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (completions.length === 0) {
    const createdDate = chore.createdAt.toDate();
    createdDate.setHours(0, 0, 0, 0);
    const daysSinceCreated = Math.floor(
      (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSinceCreated;
  }

  const latestCompletion = completions.reduce((latest, current) => {
    return current.completedAt.toMillis() > latest.completedAt.toMillis()
      ? current
      : latest;
  });

  const completionDate = latestCompletion.completedAt.toDate();
  completionDate.setHours(0, 0, 0, 0);

  const daysSince = Math.floor(
    (today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  return daysSince;
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

/**
 * Kollar om en specifik syssla är klarmarkerad idag för en viss användare
 */
export function isChoreCompletedToday(
  choreId: string,
  userId: string,
  completions: ChoreCompletion[],
): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return completions.some((completion) => {
    const completionDate = completion.completedAt.toDate();
    completionDate.setHours(0, 0, 0, 0);

    return (
      completion.choreId === choreId &&
      completion.userId === userId &&
      completionDate.getTime() === today.getTime()
    );
  });
}

/**
 * Hämtar dagens completions
 */
export function getTodaysCompletions(
  completions: ChoreCompletion[],
): ChoreCompletion[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return completions.filter((completion) => {
    const completedDate = completion.completedAt.toDate();
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  });
}
