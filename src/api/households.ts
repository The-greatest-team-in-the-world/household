import { db } from "@/../firebase-config";
import { Household } from "@/types/household";
import { getAuth } from "@firebase/auth";
import { HouseholdMember } from "@/types/household-member";
import {
    collectionGroup,
  doc,
  getDoc,
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

const auth = getAuth();


export async function getUsersHouseholds(
  uid: string,
): Promise<(Household & { isOwner: boolean })[]> {
  const snap = await getDocs(
    query(collectionGroup(db, "members"), where("userId", "==", uid)),
  );

  if (snap.empty) return [];

  // Extrahera householdIds från member-data
  const membersByHouseholdId = new Map<string, HouseholdMember>();
  snap.docs.forEach((mdoc) => {
    const memberData = mdoc.data() as HouseholdMember;
    membersByHouseholdId.set(memberData.householdId, memberData);
  });

  // Hämta alla households
  const householdIds = Array.from(membersByHouseholdId.keys());
  const households = await Promise.all(
    householdIds.map(async (hId) => {
      const hsnap = await getDoc(doc(db, "households", hId));
      if (!hsnap.exists()) return null;

      const memberData = membersByHouseholdId.get(hId)!;
      return {
        id: hsnap.id,
        ...hsnap.data(),
        isOwner: memberData.isOwner,
      } as Household & { isOwner: boolean };
    }),
  );

  return households.filter(
    (h): h is Household & { isOwner: boolean } => h !== null,
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
  return await getDocs(q);
}

async function houseCodeGenerator(length: number = 6): Promise<string> {
  const base32Chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  let isCodeTaken = true;

  do {
    result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * base32Chars.length);
      result += base32Chars[randomIndex];
    }
    const codeResult = await getHouseholdByCode(result);
    isCodeTaken = !codeResult.empty;
  } while (isCodeTaken);

  return result;
}