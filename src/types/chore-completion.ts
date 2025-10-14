import { Timestamp } from "firebase/firestore";

export type ChoreCompletion = {
  id: string;
  choreId: string;
  userId: string;
  completedAt: Timestamp;
};
