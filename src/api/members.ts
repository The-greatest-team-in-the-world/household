import { Avatar, HouseholdMember } from "@/types/household-member";
import { getAuth } from "@firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
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
): Promise<{ success: boolean; error?: string }> {
  // Skapa subcollection: households/{householdId}/members
  try {
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
    return {
      success: true,
    };
  } catch (error) {
    console.error("addNewMemberToHousehold  misslyckades", error);
    return {
      success: false,
      error: "Ett oväntat fel uppstod försök igen senare",
    };
  }
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

export async function makeMemberOwner(
  householdId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const membersRef = collection(db, "households", householdId, "members");
  const q = query(membersRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return { success: false, error: "Medlemmen hittades inte" };
  }

  const memberDoc = snapshot.docs[0];

  try {
    await Promise.all([
      updateDoc(doc(db, "households", householdId, "members", memberDoc.id), {
        isOwner: true,
        updatedAt: serverTimestamp(),
      }),
      updateDoc(doc(db, "households", householdId), {
        ownerIds: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error in makeMemberOwner:", error);
    return {
      success: false,
      error: "Ett fel uppstod vid tilldelning av ägarskap",
    };
  }
}

export async function removeMemberOwnership(
  householdId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const householdDoc = await getDoc(doc(db, "households", householdId));

  if (!householdDoc.exists()) {
    return { success: false, error: "Hushållet hittades inte" };
  }

  const householdData = householdDoc.data();
  const ownerIds = householdData.ownerIds || [];

  // Prevent removing the last owner
  if (ownerIds.length <= 1) {
    return {
      success: false,
      error:
        "Du kan inte ta bort den sista ägaren. Ett hushåll måste ha minst en ägare.",
    };
  }

  const membersRef = collection(db, "households", householdId, "members");
  const q = query(membersRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return { success: false, error: "Medlemmen hittades inte" };
  }

  const memberDoc = snapshot.docs[0];

  try {
    await Promise.all([
      updateDoc(doc(db, "households", householdId, "members", memberDoc.id), {
        isOwner: false,
        updatedAt: serverTimestamp(),
      }),
      updateDoc(doc(db, "households", householdId), {
        ownerIds: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error in removeMemberOwnership:", error);
    return {
      success: false,
      error: "Ett fel uppstod vid borttagning av ägare",
    };
  }
}

export async function leaveMemberFromHousehold(
  householdId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const membersRef = collection(db, "households", householdId, "members");
  const q = query(membersRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return { success: false, error: "Medlemmen hittades inte" };
  }

  const memberDoc = snapshot.docs[0];

  try {
    await updateDoc(
      doc(db, "households", householdId, "members", memberDoc.id),
      {
        status: "left",
        updatedAt: serverTimestamp(),
      },
    );

    return { success: true };
  } catch (error) {
    console.error("Error in leaveMemberFromHousehold:", error);
    return {
      success: false,
      error: "Ett fel uppstod när du försökte lämna hushållet",
    };
  }
}

export async function updateStatusOnHouseholdMember(
  status: string,
  householdId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  //households/{householdId}/members/{userId}
  const membersRef = collection(db, "households", householdId, "members");
  const q = query(membersRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return { success: false, error: "Medlemmen hittades inte" };
  }

  const memberDoc = snapshot.docs[0];

  try {
    await updateDoc(
      doc(db, "households", householdId, "members", memberDoc.id),
      {
        status: status,
        updatedAt: serverTimestamp(),
      },
    );
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Fel vid uppdatering av status" };
  }
}
