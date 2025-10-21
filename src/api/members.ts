import { Avatar, HouseholdMember } from "@/types/household-member";
import { getAuth } from "@firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase-config";

const auth = getAuth();

export async function getMembers(
  householdId: string,
): Promise<HouseholdMember[]> {
  const membersRef = collection(db, "households", householdId, "members");
  const snapshot = await getDocs(membersRef);
  return snapshot.docs.map((doc) => doc.data() as HouseholdMember);
}

export async function getPendingMemberCount(
  householdId: string,
): Promise<number> {
  const membersRef = collection(db, "households", householdId, "members");
  const q = query(membersRef, where("status", "==", "pending"));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function getMemberByUserId(
  householdId: string,
  userId: string,
): Promise<HouseholdMember | null> {
  const membersRef = collection(db, "households", householdId, "members");
  const q = query(membersRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as HouseholdMember;
}

export async function addNewMemberToHousehold(
  householdId: string,
  avatar: Avatar,
  nickName: string,
  isPaused: boolean,
  isOwner: boolean,
  status: string,
) {
  // Skapa subcollection: households/{householdId}/members
  await addDoc(collection(db, "households", householdId, "members"), {
    userId: auth.currentUser?.uid,
    householdId: householdId,
    status: status,
    isOwner: isOwner,
    isPaused: isPaused,
    pausePeriods: [],
    avatar: avatar,
    nickName: nickName,
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
}

export async function approveMember(
  householdId: string,
  userId: string,
): Promise<void> {
  const membersRef = collection(db, "households", householdId, "members");
  const q = query(membersRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Member not found");
  }

  const memberDoc = snapshot.docs[0];
  await updateDoc(doc(db, "households", householdId, "members", memberDoc.id), {
    status: "active",
    updatedAt: serverTimestamp(),
  });
}

export async function rejectMember(
  householdId: string,
  userId: string,
): Promise<void> {
  const membersRef = collection(db, "households", householdId, "members");
  const q = query(membersRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Member not found");
  }

  const memberDoc = snapshot.docs[0];
  await deleteDoc(doc(db, "households", householdId, "members", memberDoc.id));
}
