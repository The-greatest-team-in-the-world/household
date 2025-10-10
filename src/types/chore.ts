import { Timestamp } from "firebase/firestore";

export type Chore = {
  id?: string;
  name: string;
  description: string;
  frequency: number;
  effort: number;
  audioUrl?: string;
  imageUrl?: string;
  isArchived: boolean;
  createdByUserId: string;
  lastCompletedAt?: Timestamp;
  lastCompletedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
