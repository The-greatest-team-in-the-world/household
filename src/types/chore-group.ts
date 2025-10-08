export type ChoreGroup = {
  id: string;
  name: string;
  choreIds: string[];
  rotationIntervalDays: number;
  userRotation: string[];
  currentRotationIndex: number;
  lastRotationDate: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};
