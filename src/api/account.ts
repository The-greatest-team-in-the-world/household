import { FirebaseError } from "firebase/app";
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
import { auth, db } from "../../firebase-config";

async function ensureNotSingleOwner(uid: string) {
  console.log("[delete] ensureNotSingleOwner:start", uid);
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
      console.log("[delete] single-owner found");
      throw new Error("single-owner");
    }
  }
  console.log("[delete] ensureNotSingleOwner:ok");
}

async function removeAllMemberships(uid: string) {
  console.log("[delete] removeAllMemberships:start");
  const snap = await getDocs(
    query(collectionGroup(db, "members"), where("userId", "==", uid)),
  );

  if (snap.empty) {
    console.log("[delete] removeAllMemberships:none");
    return;
  }

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

  if (ops > 0) await batch.commit();
  console.log("[delete] removeAllMemberships:ok count=", snap.docs.length);
}

async function removeUserProfile(uid: string) {
  console.log("[delete] removeUserProfile:start");
  const userDoc = doc(db, "users", uid);
  await deleteDoc(userDoc).catch(() => {});
  console.log("[delete] removeUserProfile:ok");
}

async function deleteAuthAccount() {
  console.log("[delete] deleteAuthAccount:start");
  const cu = auth.currentUser;
  if (!cu) {
    console.log("[delete] deleteAuthAccount:no-user");
    return;
  }
  try {
    await cu.delete(); // funkar i RN utan named import
    console.log("[delete] deleteAuthAccount:ok");
  } catch (e: any) {
    if (e instanceof FirebaseError) {
      console.log(
        "[delete] deleteAuthAccount:firebase-error",
        e.code,
        e.message,
      );
      if (e.code === "auth/requires-recent-login") {
        throw { code: "reauth-required", message: e.message };
      }
    } else {
      console.log("[delete] deleteAuthAccount:error", e);
    }
    throw e;
  }
}

export async function deleteAccountWithChecks(uid: string) {
    console.log("[delete] flow:start for uid", uid);
  await ensureNotSingleOwner(uid);
  await removeAllMemberships(uid);
  await removeUserProfile(uid);
  await deleteAuthAccount();
  console.log("[delete] flow:complete");
}
