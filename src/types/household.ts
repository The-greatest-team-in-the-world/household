import { Timestamp } from "firebase/firestore";
import { Chore } from "./chore";
import { ChoreCompletion } from "./chore-completion";

export type Household = {
  id: string;
  name: string;
  code: string;
  chores: Chore[];
  choreCompletions: ChoreCompletion[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
