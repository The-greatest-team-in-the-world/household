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
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
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

export function initHouseholdsListener(
  userId: string,
  onUpdate: (
    households:
      | (Household & {
          isOwner: boolean;
          status: "pending" | "active" | "left";
          isPaused: boolean;
        })[]
      | null,
  ) => void,
): () => void {
  console.log("Setting up households listener for user:", userId);

  // Query all member documents for this user across all households
  const membersQuery = query(
    collectionGroup(db, "members"),
    where("userId", "==", userId),
  );

  const unsubscribe = onSnapshot(membersQuery, async (snapshot) => {
    if (snapshot.empty) {
      onUpdate([]);
      console.log("No households found for user");
      return;
    }

    // Extract household IDs and member data
    const membersByHouseholdId = new Map<
      string,
      {
        isOwner: boolean;
        status: "pending" | "active" | "left";
        isPaused: boolean;
      }
    >();

    snapshot.docs.forEach((mdoc) => {
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

    // Fetch all households
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

    const validHouseholds = households.filter(
      (
        h,
      ): h is Household & {
        isOwner: boolean;
        status: "pending" | "active" | "left";
        isPaused: boolean;
      } => h !== null,
    );

    onUpdate(validHouseholds.length > 0 ? validHouseholds : null);
    console.log(
      `Households updated for user ${userId}:`,
      validHouseholds.length,
    );
  });

  return unsubscribe;
}

export async function createNewHousehold(
  name: string,
): Promise<{ householdId?: string; success: boolean; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, "households"), {
      name: name,
      code: await houseCodeGenerator(),
      ownerIds: [auth.currentUser?.uid],
      createdAt: serverTimestamp(),
    });
    return { householdId: docRef.id, success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: `Kunde inte skapa nytt hushåll! ERROR: ${error}`,
    };
  }
}

export async function getHouseholdByCode(
  code: string,
): Promise<{ success: boolean; error?: string; household?: Household }> {
  try {
    const q = query(collection(db, "households"), where("code", "==", code));
    const snapshot = await getDocs(q);

    const firstDoc = snapshot.docs[0];

    if (!firstDoc) {
      return { success: false, error: "Kunde inte hitta hushåll!" };
    }

    const data = firstDoc.data();
    return {
      success: true,
      household: {
        id: firstDoc.id,
        name: data.name,
        code: data.code,
        ownerIds: data.ownerIds,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Kunde inte hitta hushåll",
    };
  }
}

export async function getHouseholdById(
  id: string,
): Promise<{ success: boolean; error?: string; household?: Household }> {
  try {
    const docRef = doc(db, "households", id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return { success: false, error: "Kunde inte hitta hushåll" };
    }

    const data = snapshot.data();
    return {
      success: true,
      household: {
        id: snapshot.id,
        name: data.name,
        code: data.code,
        ownerIds: data.ownerIds,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Kunde inte hämta hushåll",
    };
  }
}

async function householdCodeExists(code: string): Promise<boolean> {
  try {
    const q = query(collection(db, "households"), where("code", "==", code));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error(error);
    throw error;
  }
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

export async function updateHouseholdName(
  householdId: string,
  newName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!newName || newName.trim().length === 0) {
      return { success: false, error: "Namnet får inte vara tomt" };
    }

    const householdRef = doc(db, "households", householdId);
    await updateDoc(householdRef, {
      name: newName.trim(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating household name:", error);
    return {
      success: false,
      error: "Kunde inte uppdatera hushållsnamn",
    };
  }
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
