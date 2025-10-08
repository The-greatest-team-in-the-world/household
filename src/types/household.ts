import { Chore } from "./chore";
import { ChoreCompletion } from "./chore-completion";

export type Household = {
  id: string;
  name: string;
  code: string;
  chores: Chore[];
  choreCompletions: ChoreCompletion[];
  ownerIds: string[];
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
};
