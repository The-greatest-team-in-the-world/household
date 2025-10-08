export type ChoreCompletion = {
  id: string;
  choreId: string;
  userId: string;
  userName: string;
  choreEffort: number;
  choreName: string;
  completedAt: Date;
  notes?: string;
};
