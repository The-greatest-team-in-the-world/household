import { Timestamp } from "firebase/firestore";

export type ChoreGroup = {
  id: string;
  name: string;
  choreIds: string[];
  rotationIntervalDays: number;
  userRotation: string[] | null;
  currentRotationIndex: number;
  lastRotationDate: Timestamp | null;
  createdBy: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};
