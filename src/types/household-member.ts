export type HouseholdMember = {
  userId: string;
  householdId: string;
  status: "pending" | "active" | "left";
  isOwner: boolean;
  isPaused: boolean;
  pausePeriods: {
    startDate: Date;
    endDate: Date | null;
  };
  avatar: {
    emoji: string;
    color: string;
  };
  name: string;
  joinedAt: Date;
  updatedAt: Date;
};
