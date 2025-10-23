import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
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

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

interface AuthResult {
  success: boolean;
  user: User | null;
  error: { code: string; message: string } | null;
}

export const signInUser = async (data: LoginData): Promise<AuthResult> => {
  try {
    const userCredentials = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );
    return { success: true, user: userCredentials.user, error: null };
  } catch (error) {
    if (error instanceof FirebaseError) {
      return {
        success: false,
        user: null,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }
    return {
      success: false,
      user: null,
      error: {
        code: "unknown",
        message: "Ett oväntat fel inträffade",
      },
    };
  }
};

export const registerUser = async (data: RegisterData): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );

    await updateProfile(userCredential.user, {
      displayName: data.displayName,
    });

    await userCredential.user.reload();

    return { success: true, user: userCredential.user, error: null };
  } catch (error) {
    if (error instanceof FirebaseError) {
      return {
        success: false,
        user: null,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }
    return {
      success: false,
      user: null,
      error: {
        code: "unknown",
        message: "Ett oväntat fel inträffade",
      },
    };
  }
};

export async function signOutUser() {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunde inte logga ut",
    };
  }
}

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
      throw {
        code: "single-owner",
        message: "User is the sole owner in a household.",
      };
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
    await cu.delete();
    console.log("[delete] deleteAuthAccount:ok");
  } catch (e: any) {
    console.log("[delete] deleteAuthAccount:error", e);
    throw {
      code: e?.code ?? "unknown",
      message: e?.message ?? "Delete failed.",
    };
  }
}

async function deleteAccountWithChecks(uid: string) {
  console.log("[delete] flow:start for uid", uid);
  await ensureNotSingleOwner(uid);
  await removeAllMemberships(uid);
  await removeUserProfile(uid);
  await deleteAuthAccount();
  console.log("[delete] flow:complete");
}

export async function deleteAccount() {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    return {
      success: false,
      error: { code: "no-user", message: "Ingen användare inloggad." },
    };
  }
  try {
    await deleteAccountWithChecks(uid);
    return { success: true, error: null };
  } catch (e: any) {
    if (e?.code === "single-owner") {
      return {
        success: false,
        error: {
          code: "single-owner",
          message: "Du är enda admin i minst ett hushåll.",
        },
      };
    }
      if (e?.code === "auth/requires-recent-login") {
    return {
      success: false,
      error: {
        code: "reauth-required",
        message:
          "Av säkerhetsskäl måste du logga in igen innan du kan radera kontot.",
      },
    };
  }
    return {
      success: false,
      error: {
        code: e?.code ?? "unknown",
        message: e?.message ?? "Kunde inte ta bort kontot.",
      },
    };
  }
}
