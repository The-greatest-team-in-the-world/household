export type User = {
  id: string;
  email: string;
  name: string;
  theme: "light" | "dark" | "auto";
  householdIds: string[];
  activeHouseholdId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
