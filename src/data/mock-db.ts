import { Chore } from "@/types/chore";
import { ChoreAssignment } from "@/types/chore-assignment";
import { ChoreCompletion } from "@/types/chore-completion";
import { ChoreGroup } from "@/types/chore-group";
import { Household } from "@/types/household";
import { HouseholdMember } from "@/types/household-member";
import { Timestamp } from "firebase/firestore";

const now = new Date();
const daysAgo = (d: number) =>
  Timestamp.fromDate(new Date(now.getTime() - d * 86400000));

export const FIREBASE_USER_IDS = {
  kalle: "firebase-auth-uid-kalle-123",
  joakim: "firebase-auth-uid-joakim-456",
  knatte: "firebase-auth-uid-knatte-789",
};

// --- CHORES ---
export const mockChores: Chore[] = [
  {
    id: "chore-1",
    name: "Diska tallrikar",
    description: "Köket måste hållas skinande rent!",
    frequency: 1,
    effort: 2,
    audioUrl: null,
    imageUrl: null,
    isArchived: false,
    lastCompletedAt: daysAgo(1),
    lastCompletedBy: FIREBASE_USER_IDS.kalle,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(1),
    assignedTo: [],
  },
  {
    id: "chore-2",
    name: "Polera guldmynt",
    description: "Joakim ser gärna att mynten blänker!",
    frequency: 2,
    effort: 4,
    audioUrl: null,
    imageUrl: null,
    isArchived: false,
    lastCompletedAt: daysAgo(2),
    lastCompletedBy: FIREBASE_USER_IDS.joakim,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(2),
    assignedTo: [],
  },
  {
    id: "chore-3",
    name: "Dammsuga vardagsrummet",
    description: "Mattan behöver städas!",
    frequency: 3,
    effort: 3,
    audioUrl: null,
    imageUrl: null,
    isArchived: false,
    lastCompletedAt: daysAgo(5),
    lastCompletedBy: FIREBASE_USER_IDS.kalle,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(5),
    assignedTo: [],
  },
  {
    id: "chore-4",
    name: "Tvätta",
    description: "Tvättkorgarna är fulla!",
    frequency: 2,
    effort: 3,
    audioUrl: null,
    imageUrl: null,
    isArchived: false,
    lastCompletedAt: daysAgo(3),
    lastCompletedBy: FIREBASE_USER_IDS.knatte,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(3),
    assignedTo: [],
  },
  {
    id: "chore-5",
    name: "Ta ut soporna",
    description: "Kärlarna är fulla!",
    frequency: 1,
    effort: 1,
    audioUrl: null,
    imageUrl: null,
    isArchived: false,
    lastCompletedAt: daysAgo(4),
    lastCompletedBy: FIREBASE_USER_IDS.joakim,
    createdAt: daysAgo(25),
    updatedAt: daysAgo(4),
    assignedTo: [],
  },
];

// --- CHORE COMPLETIONS ---
export const mockChoreCompletions: ChoreCompletion[] = [
  {
    id: "cc-1",
    choreId: "chore-1",
    userId: FIREBASE_USER_IDS.knatte,
    completedAt: daysAgo(1),
  },
  {
    id: "cc-3",
    choreId: "chore-2",
    userId: FIREBASE_USER_IDS.joakim,
    completedAt: daysAgo(2),
  },
  {
    id: "cc-5",
    choreId: "chore-2",
    userId: FIREBASE_USER_IDS.joakim,
    completedAt: daysAgo(1),
  },
  {
    id: "cc-6",
    choreId: "chore-3",
    userId: FIREBASE_USER_IDS.joakim,
    completedAt: daysAgo(1),
  },
  {
    id: "cc-7",
    choreId: "chore-3",
    userId: FIREBASE_USER_IDS.joakim,
    completedAt: daysAgo(1),
  },
  {
    id: "cc-8",
    choreId: "chore-4",
    userId: FIREBASE_USER_IDS.knatte,
    completedAt: daysAgo(1),
  },
  {
    id: "cc-9",
    choreId: "chore-4",
    userId: FIREBASE_USER_IDS.knatte,
    completedAt: daysAgo(1),
  },
  {
    id: "cc-10",
    choreId: "chore-4",
    userId: FIREBASE_USER_IDS.knatte,
    completedAt: daysAgo(1),
  },
  {
    id: "cc-11",
    choreId: "chore-5",
    userId: FIREBASE_USER_IDS.joakim,
    completedAt: daysAgo(1),
  },
  {
    id: "cc-12",
    choreId: "chore-5",
    userId: FIREBASE_USER_IDS.kalle,
    completedAt: daysAgo(1),
  },
  {
    id: "cc-13",
    choreId: "chore-5",
    userId: FIREBASE_USER_IDS.kalle,
    completedAt: daysAgo(1),
  },
  {
    id: "cc-14",
    choreId: "chore-5",
    userId: FIREBASE_USER_IDS.kalle,
    completedAt: daysAgo(1),
  },
];

// --- CHORE ASSIGNMENTS ---
export const mockChoreAssignments: ChoreAssignment[] = [
  {
    id: "assign-1",
    choreId: "chore-1",
    userId: FIREBASE_USER_IDS.knatte,
    assignedBy: FIREBASE_USER_IDS.kalle,
    dueDate: daysAgo(-1),
    isCompleted: true,
    choreName: "Diska tallrikar",
    userName: "Knatte Anka",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
  },
  {
    id: "assign-2",
    choreId: "chore-2",
    userId: FIREBASE_USER_IDS.joakim,
    assignedBy: FIREBASE_USER_IDS.kalle,
    dueDate: daysAgo(0),
    isCompleted: false,
    choreName: "Polera guldmynt",
    userName: "Joakim von Anka",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(0),
  },
  {
    id: "assign-3",
    choreId: "chore-4",
    userId: FIREBASE_USER_IDS.kalle,
    assignedBy: FIREBASE_USER_IDS.kalle,
    dueDate: daysAgo(0),
    isCompleted: true,
    choreName: "Tvätta",
    userName: "Kalle Anka",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(0),
  },
];

// --- CHORE GROUPS ---
export const mockChoreGroups: ChoreGroup[] = [
  {
    id: "group-1",
    name: "Veckosysslor",
    choreIds: ["chore-1", "chore-2"],
    rotationIntervalDays: 7,
    userRotation: ["member-1", "member-2", "member-3"],
    currentRotationIndex: 1,
    lastRotationDate: daysAgo(3),
    createdBy: "member-1",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(3),
  },
];

// --- HOUSEHOLD MEMBERS ---
export const mockHouseholdMembers: HouseholdMember[] = [
  {
    userId: FIREBASE_USER_IDS.kalle,
    householdId: "house-ankeborg",
    status: "active",
    isOwner: true,
    isPaused: false,
    pausePeriods: [],
    avatar: { emoji: "🦆", color: "#1E90FF" },
    nickName: "Kalle Anka",
    joinedAt: daysAgo(60),
    updatedAt: daysAgo(0),
  },
  {
    userId: FIREBASE_USER_IDS.knatte,
    householdId: "house-ankeborg",
    status: "active",
    isOwner: false,
    isPaused: false,
    pausePeriods: [],
    avatar: { emoji: "🧢", color: "#FF0000" },
    nickName: "Knatte Anka",
    joinedAt: daysAgo(45),
    updatedAt: daysAgo(0),
  },
  {
    userId: FIREBASE_USER_IDS.joakim,
    householdId: "house-ankeborg",
    status: "active",
    isOwner: false,
    isPaused: false,
    pausePeriods: [],
    avatar: { emoji: "💰", color: "#FFD700" },
    nickName: "Joakim von Anka",
    joinedAt: daysAgo(90),
    updatedAt: daysAgo(0),
  },
];

// --- HOUSEHOLD ---
export const mockHouseholds: Household[] = [
  {
    id: "house-ankeborg",
    name: "Kalles Villa",
    code: "ANKA123",
    ownerIds: [FIREBASE_USER_IDS.kalle],
    createdAt: daysAgo(90),
    updatedAt: daysAgo(0),
  },
];

// --- DATABASE MOCK ---
export const db = {
  households: mockHouseholds,
  householdMembers: mockHouseholdMembers,
  chores: mockChores,
  choreCompletions: mockChoreCompletions,
  choreAssignments: mockChoreAssignments,
  choreGroups: mockChoreGroups,
};
