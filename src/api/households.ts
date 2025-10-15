import { db } from "@/../firebase-config";
import { Household } from "@/types/household";
import { getAuth } from "@firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

const auth = getAuth();

export async function getUsersHouseholds(uid: string): Promise<Household[]> {
  const householdsRef = collection(db, "households");

  const q = query(householdsRef, where("ownerIds", "array-contains", uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Household,
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
