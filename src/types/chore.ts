export type Chore = {
  id: string;
  name: string;
  description: string;
  frequency: number;
  effort: number;
  audioUrl?: string;
  imageUrl?: string;
  isArchived: boolean;
  createdByUserId: string;
  lastCompletedAt?: Date;
  lastCompletedBy?: string;
  createdAt: Date;
  updatedAt: Date;
};
