export type ChoreAssignment = {
  id: string;
  choreId: string;
  userId: string;
  assignedBy: string;
  dueDate?: Date;
  isCompleted: boolean;
  choreName: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
};
