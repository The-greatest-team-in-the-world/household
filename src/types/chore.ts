import { Timestamp } from "firebase/firestore";

export type Chore = {
  id: string;
  name: string;
  description: string;
  frequency: number | null;
  effort: number;
  audioUrl: string | null;
  imageUrl: string | null;
  isArchived: boolean;
  lastCompletedAt: Timestamp | null;
  lastCompletedBy: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
