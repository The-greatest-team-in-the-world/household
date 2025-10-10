import { Timestamp } from "firebase/firestore";

export type User = {
  id?: string;
  email: string;
  name: string;
  theme: "light" | "dark" | "auto";
  householdIds: string[];
  activeHouseholdId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
