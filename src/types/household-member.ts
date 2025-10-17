import { Timestamp } from "firebase/firestore";

export interface Avatar {
  emoji: string;
  color: string;
}

export type HouseholdMember = {
  userId: string;
  householdId: string;
  status: "pending" | "active" | "left";
  isOwner: boolean;
  isPaused: boolean;
  pausePeriods: {
    startDate: Timestamp | null;
    endDate: Timestamp | null;
  }[];
  avatar: Avatar;
  nickName: string;
  joinedAt: Timestamp;
  updatedAt: Timestamp;
};
