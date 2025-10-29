import { db } from "@/../firebase-config";
import { Household } from "@/types/household";
import { getAuth } from "@firebase/auth";
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

const auth = getAuth();

export async function getUsersHouseholds(uid: string): Promise<
  (Household & {
    isOwner: boolean;
    status: "pending" | "active" | "left";
    isPaused: boolean;
  })[]
> {
  const snap = await getDocs(
    query(collectionGroup(db, "members"), where("userId", "==", uid)),
  );

  if (snap.empty) return [];

  // Extrahera householdIds från member-data
  const membersByHouseholdId = new Map<
    string,
    {
      isOwner: boolean;
      status: "pending" | "active" | "left";
      isPaused: boolean;
    }
  >();
  snap.docs.forEach((mdoc) => {
    const data = mdoc.data();
    const householdId = data.householdId;
    if (householdId && typeof householdId === "string") {
      membersByHouseholdId.set(householdId, {
        isOwner: data.isOwner,
        status: (data.status ?? "active") as "pending" | "active" | "left",
        isPaused: !!data.isPaused,
      });
    }
  });

  // Hämta alla households
  const householdIds = Array.from(membersByHouseholdId.keys());
  const households = await Promise.all(
    householdIds.map(async (hId) => {
      const hsnap = await getDoc(doc(db, "households", hId));
      if (!hsnap.exists()) return null;

      const memberData = membersByHouseholdId.get(hId)!;
      const hdata = hsnap.data();
      return {
        id: hsnap.id,
        name: hdata.name,
        code: hdata.code,
        ownerIds: hdata.ownerIds,
        createdAt: hdata.createdAt,
        updatedAt: hdata.updatedAt,
        isOwner: memberData.isOwner,
        status: memberData.status,
        isPaused: memberData.isPaused,
      } as Household & {
        isOwner: boolean;
        status: "pending" | "active" | "left";
        isPaused: boolean;
      };
    }),
  );

  return households.filter(
    (
      h,
    ): h is Household & {
      isOwner: boolean;
      status: "pending" | "active" | "left";
      isPaused: boolean;
    } => h !== null,
  );
}

export async function createNewHousehold(name: string): Promise<string> {
  const docRef = await addDoc(collection(db, "households"), {
    name: name,
    code: await houseCodeGenerator(),
    ownerIds: [auth.currentUser?.uid],
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getHouseholdByCode(code: string) {
  const q = query(collection(db, "households"), where("code", "==", code));
  const snapshot = await getDocs(q);

  const firstDoc = snapshot.docs[0];
  if (!firstDoc) {
    return null;
  }

  const data = firstDoc.data();
  return {
    id: firstDoc.id,
    name: data.name,
    code: data.code,
    ownerIds: data.ownerIds,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as Household;
}

export async function getHouseholdById(id: string) {
  const docRef = doc(db, "households", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name,
    code: data.code,
    ownerIds: data.ownerIds,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as Household;
}

export async function householdCodeExists(code: string): Promise<boolean> {
  const q = query(collection(db, "households"), where("code", "==", code));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

async function houseCodeGenerator(length: number = 6): Promise<string> {
  const base32Chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  do {
    result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * base32Chars.length);
      result += base32Chars[randomIndex];
    }
  } while (await householdCodeExists(result));

  return result;
}

export async function deleteHousehold(
  householdId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Define all subcollections to delete
    const subcollections = [
      "members",
      "chores",
      "completions",
      "assignments",
      "choreGroups",
    ];

    // Delete all subcollections in parallel
    const deletePromises = subcollections.map(async (subcollectionName) => {
      const subcollectionRef = collection(
        db,
        "households",
        householdId,
        subcollectionName,
      );
      const snapshot = await getDocs(subcollectionRef);
      const deleteDocsPromises = snapshot.docs.map((docSnapshot) =>
        deleteDoc(docSnapshot.ref),
      );
      return Promise.all(deleteDocsPromises);
    });

    await Promise.all(deletePromises);

    // Delete the household document itself
    await deleteDoc(doc(db, "households", householdId));

    return { success: true };
  } catch (error) {
    console.error("Error in deleteHousehold:", error);
    return {
      success: false,
      error: "Ett fel uppstod vid radering av hushållet",
    };
  }
}
