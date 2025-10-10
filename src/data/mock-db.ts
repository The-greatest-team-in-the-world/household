import { Chore } from "@/types/chore";
import { ChoreAssignment } from "@/types/chore-assignment";
import { ChoreCompletion } from "@/types/chore-completion";
import { ChoreGroup } from "@/types/chore-group";
import { Household } from "@/types/household";
import { HouseholdMember } from "@/types/household-member";
import { User } from "@/types/user";
import { Timestamp } from "firebase/firestore";

const now = new Date();
const daysAgo = (d: number) =>
  Timestamp.fromDate(new Date(now.getTime() - d * 86400000));

// --- USERS ---
export const mockUsers: User[] = [
  {
    id: "user-kalle",
    email: "kalle@ankeborg.se",
    name: "Kalle Anka",
    theme: "dark",
    householdIds: ["house-ankeborg"],
    activeHouseholdId: "house-ankeborg",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(0),
  },
  {
    id: "user-joakim",
    email: "joakim@ankeborg.se",
    name: "Joakim von Anka",
    theme: "light",
    householdIds: ["house-ankeborg"],
    activeHouseholdId: "house-ankeborg",
    createdAt: daysAgo(90),
    updatedAt: daysAgo(0),
  },
  {
    id: "user-knatte",
    email: "knatte@ankeborg.se",
    name: "Knatte Anka",
    theme: "auto",
    householdIds: ["house-ankeborg"],
    activeHouseholdId: "house-ankeborg",
    createdAt: daysAgo(45),
    updatedAt: daysAgo(0),
  },
];

// --- CHORES ---
export const mockChores: Chore[] = [
  {
    id: "chore-1",
    name: "Diska tallrikar",
    description: "Köket måste hållas skinande rent!",
    frequency: 1,
    effort: 2,
    isArchived: false,
    createdByUserId: "user-kalle",
    lastCompletedAt: daysAgo(1),
    lastCompletedBy: "user-knatte",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(1),
  },
  {
    id: "chore-2",
    name: "Polera guldmynt",
    description: "Joakim ser gärna att mynten blänker!",
    frequency: 2,
    effort: 4,
    isArchived: false,
    createdByUserId: "user-joakim",
    lastCompletedAt: daysAgo(2),
    lastCompletedBy: "user-joakim",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(2),
  },
  {
    id: "chore-3",
    name: "Dammsuga vardagsrummet",
    description: "Mattan behöver städas!",
    frequency: 3,
    effort: 3,
    isArchived: false,
    createdByUserId: "user-kalle",
    lastCompletedAt: daysAgo(5),
    lastCompletedBy: "user-kalle",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(5),
  },
  {
    id: "chore-4",
    name: "Tvätta",
    description: "Tvättkorgarna är fulla!",
    frequency: 2,
    effort: 3,
    isArchived: false,
    createdByUserId: "user-knatte",
    lastCompletedAt: daysAgo(3),
    lastCompletedBy: "user-knatte",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(3),
  },
  {
    id: "chore-5",
    name: "Ta ut soporna",
    description: "Kärlarna är fulla!",
    frequency: 1,
    effort: 1,
    isArchived: false,
    createdByUserId: "user-joakim",
    lastCompletedAt: daysAgo(4),
    lastCompletedBy: "user-joakim",
    createdAt: daysAgo(25),
    updatedAt: daysAgo(4),
  },
];

// --- CHORE COMPLETIONS ---
export const mockChoreCompletions: ChoreCompletion[] = [
  {
    id: "cc-1",
    choreId: "chore-1",
    userId: "user-knatte",
    userName: "Knatte Anka",
    choreEffort: 2,
    choreName: "Diska tallrikar",
    completedAt: daysAgo(1),
    notes: "Diskade alla koppar!",
  },
  {
    id: "cc-2",
    choreId: "chore-2",
    userId: "user-joakim",
    userName: "Joakim von Anka",
    choreEffort: 4,
    choreName: "Polera guldmynt",
    completedAt: daysAgo(2),
  },
];

// --- CHORE ASSIGNMENTS ---
export const mockChoreAssignments: ChoreAssignment[] = [
  {
    id: "assign-1",
    choreId: "chore-1",
    userId: "user-knatte",
    assignedBy: "user-kalle",
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
    userId: "user-joakim",
    assignedBy: "user-kalle",
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
    userId: "user-kalle",
    assignedBy: "user-kalle",
    dueDate: daysAgo(0),
    isCompleted: true,
    choreName: "Tvätta",
    userName: "Joakim von Anka",
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
    userRotation: ["user-kalle", "user-knatte", "user-joakim"],
    currentRotationIndex: 1,
    lastRotationDate: daysAgo(3),
    createdBy: "user-kalle",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(3),
  },
];

// --- HOUSEHOLD MEMBERS ---
export const mockHouseholdMembers: HouseholdMember[] = [
  {
    userId: "user-kalle",
    householdId: "house-ankeborg",
    status: "active",
    isOwner: true,
    isPaused: false,
    pausePeriods: { startDate: daysAgo(0), endDate: null },
    avatar: { emoji: "🦆", color: "#1E90FF" },
    name: "Kalle Anka",
    joinedAt: daysAgo(60),
    updatedAt: daysAgo(0),
  },
  {
    userId: "user-knatte",
    householdId: "house-ankeborg",
    status: "active",
    isOwner: false,
    isPaused: false,
    pausePeriods: { startDate: daysAgo(0), endDate: null },
    avatar: { emoji: "🧢", color: "#FF0000" },
    name: "Knatte Anka",
    joinedAt: daysAgo(45),
    updatedAt: daysAgo(0),
  },
  {
    userId: "user-joakim",
    householdId: "house-ankeborg",
    status: "active",
    isOwner: false,
    isPaused: false,
    pausePeriods: { startDate: daysAgo(0), endDate: null },
    avatar: { emoji: "💰", color: "#FFD700" },
    name: "Joakim von Anka",
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
    chores: mockChores,
    choreCompletions: mockChoreCompletions,
    ownerIds: ["user-kalle"],
    memberIds: ["user-kalle", "user-knatte", "user-joakim"],
    createdAt: daysAgo(90),
    updatedAt: daysAgo(0),
  },
];

// --- DATABASE MOCK ---
export const db = {
  users: mockUsers,
  households: mockHouseholds,
  householdMembers: mockHouseholdMembers,
  chores: mockChores,
  choreCompletions: mockChoreCompletions,
  choreAssignments: mockChoreAssignments,
  choreGroups: mockChoreGroups,
};
