import { Timestamp } from "firebase/firestore";

export type ChoreCompletion = {
  id?: string;
  choreId: string;
  userId: string;
  userName: string;
  choreEffort: number;
  choreName: string;
  completedAt: Timestamp;
  notes?: string;
};
