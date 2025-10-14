import { Timestamp } from "firebase/firestore";

export type ChoreAssignment = {
  id: string;
  choreId: string;
  userId: string; // Firebase user ID
  assignedBy: string;
  dueDate: Timestamp | null;
  isCompleted: boolean;
  choreName: string;
  userName: string; // Firebase display name
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
};
