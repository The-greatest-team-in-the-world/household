import { Timestamp } from "firebase/firestore";

export type ChoreAssignment = {
  id?: string;
  choreId: string;
  userId: string;
  assignedBy: string;
  dueDate?: Timestamp;
  isCompleted: boolean;
  choreName: string;
  userName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
