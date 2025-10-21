import { deleteUser, getAuth } from "@firebase/auth";
import {
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase-config";

async function ensureNotSingleOwner(uid: string) {
  const ownerSnap = await getDocs(
    query(
      collectionGroup(db, "members"),
      where("userId", "==", uid),
      where("isOwner", "==", true),
    ),
  );

  for (const mdoc of ownerSnap.docs) {
    const membersCol = mdoc.ref.parent;
    const ownersInHouseSnap = await getDocs(
      query(membersCol, where("isOwner", "==", true), limit(2)),
    );

    const hasAnotherOwner = ownersInHouseSnap.docs.some(
      (d) => d.data().userId !== uid,
    );

    if (!hasAnotherOwner) {
      throw new Error("single-owner");
    }
  }
}

async function removeAllMemberships(uid: string) {
  const snap = await getDocs(
    query(collectionGroup(db, "members"), where("userId", "==", uid)),
  );

  if (snap.empty) return;

  let batch = writeBatch(db);
  let ops = 0;

  for (const mdoc of snap.docs) {
    batch.delete(mdoc.ref);
    ops++;
    if (ops === 450) {
      await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  }

  if (ops > 0) {
    await batch.commit();
  }
}

async function removeUserProfile(uid: string) {
  const userDoc = doc(db, "users", uid);
  await deleteDoc(userDoc).catch(() => {});
}

async function deleteAuthAccount() {
  const auth = getAuth();
  if (!auth.currentUser) return;
  await deleteUser(auth.currentUser);
}

export async function deleteAccountWithChecks(uid: string) {
  await ensureNotSingleOwner(uid);
  await removeAllMemberships(uid);
  await removeUserProfile(uid);
  await deleteAuthAccount();
}
