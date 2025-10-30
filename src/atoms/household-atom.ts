import { getUsersHouseholds } from "@/api/households";
import { Household } from "@/types/household";
import {
  collectionGroup,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { atom } from "jotai";
import { db } from "../../firebase-config";
import { userAtom } from "./auth-atoms";

export const currentHouseholdAtom = atom<
  | (Household & {
      isOwner: boolean;
      status: "pending" | "active" | "left";
      isPaused: boolean;
    })
  | null
>(null);

export const getUsersHouseholdsAtom = atom(null, async (get, set) => {
  const user = get(userAtom);
  if (!user) return;

  console.log("Fetching households for user:", user.uid);
  const data = await getUsersHouseholds(user.uid);
  set(householdsAtom, data.length > 0 ? data : null);
});

export const householdsAtom = atom<
  | (Household & {
      isOwner: boolean;
      status: "pending" | "active" | "left";
      isPaused: boolean;
    })[]
  | null
>(null);

export const resetHouseholdAtomsAtom = atom(null, (get, set) => {
  set(currentHouseholdAtom, null);
  set(householdsAtom, null);
});

export const initHouseholdsListenerAtom = atom(
  null,
  (get, set, userId: string) => {
    console.log("Setting up households listener for user:", userId);

    // Query all member documents for this user across all households
    const membersQuery = query(
      collectionGroup(db, "members"),
      where("userId", "==", userId),
    );

    const unsubscribe = onSnapshot(membersQuery, async (snapshot) => {
      if (snapshot.empty) {
        set(householdsAtom, null);
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

      set(householdsAtom, validHouseholds.length > 0 ? validHouseholds : null);
      console.log(
        `Households updated for user ${userId}:`,
        validHouseholds.length,
      );
    });

    return unsubscribe;
  },
);
