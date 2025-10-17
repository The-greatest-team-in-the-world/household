import { Avatar, HouseholdMember } from "@/types/household-member";
import { getAuth } from "@firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
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
