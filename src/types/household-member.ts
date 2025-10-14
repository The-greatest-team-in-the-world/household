import { Timestamp } from "firebase/firestore";

export type HouseholdMember = {
  userId: string;
  householdId: string;
  status: "pending" | "active" | "left";
  isOwner: boolean;
  isPaused: boolean;
  pausePeriods: Array<{
    startDate: Timestamp | null;
    endDate: Timestamp | null;
  }>;
  avatar: {
    emoji: string;
    color: string;
  };
  nickName: string;
  joinedAt: Timestamp;
  updatedAt: Timestamp;
};
