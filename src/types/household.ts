import { Timestamp } from "firebase/firestore";

export type Household = {
  id: string;
  name: string;
  code: string;
  ownerIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
