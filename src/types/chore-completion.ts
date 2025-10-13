import { Timestamp } from "firebase/firestore";

export type ChoreCompletion = {
  id: string;
  choreId: string;
  houseHoldMemberId: string;
  completedAt: Timestamp;
};
