import { HouseholdMember } from "@/types/household-member";
import { getAuth } from "@firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
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
  avatar: { emoji: string; color: string },
  nickName: string,
  isPaused: boolean,
  isOwner: boolean,
  status: string,
) {
  // Skapa subcollection: households/{householdId}/members
  await addDoc(collection(db, "households", householdId, "members"), {
    userId: auth.currentUser?.uid,
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
