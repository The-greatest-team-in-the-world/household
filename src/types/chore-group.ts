import { Timestamp } from "firebase/firestore";

export type ChoreGroup = {
  id?: string;
  name: string;
  choreIds: string[];
  rotationIntervalDays: number;
  userRotation: string[];
  currentRotationIndex: number;
  lastRotationDate: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
