import { collectionGroup, getDocs, limit, query, where, writeBatch } from "firebase/firestore";
import { db } from "../../firebase-config";

async function ensureNotSingleOwner(uid: string) {
    const ownerSnap = await getDocs(
        query( 
            collectionGroup(db, "members"),
            where("isOwner", "==", true),
            where("isOwner", "==", true),
        )
    );

    for (const mdoc of ownerSnap.docs) {
        const membersCol = mdoc.ref.parent;
        const ownerSnap = await getDocs(
            query(
                membersCol,
                where("isOwner", "==", true), limit(2)
            )
        );

        const hasAnotherOwner = ownerSnap.docs.some((d) => d.data().userId !== uid);

            if (!hasAnotherOwner) {
      throw new Error("single-owner");
    }
  }
}

