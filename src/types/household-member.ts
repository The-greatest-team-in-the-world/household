import { Timestamp } from "firebase/firestore";

export type HouseholdMember = {
  userId: string;
  householdId: string;
  status: "pending" | "active" | "left";
  isOwner: boolean;
  isPaused: boolean;
  pausePeriods: {
    startDate: Timestamp;
    endDate: Timestamp | null;
  };
  avatar: {
    emoji: string;
    color: string;
  };
  name: string;
  joinedAt: Timestamp;
  updatedAt: Timestamp;
};
