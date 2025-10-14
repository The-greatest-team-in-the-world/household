// export default function getMemberAvatar(id: string) {
//   const member = db.householdMembers.find((m) => m.id === id);
//   if (!member) {
//     console.warn(`Cannot find household member with id: ${id}.`);
//     return { color: "#000", emoji: "⚠️" };
//   }
//   return member.avatar;
// }

import { getMembers } from "@/api/members";

export default async function getMemberAvatar(
  householdId: string,
  userId: string
) {
  const members = await getMembers(householdId);
  const member = members.find((m) => m.userId === userId);

  if (!member) {
    console.warn(
      `Cannot find household member with userId: ${userId} in household: ${householdId}`
    );
    return { color: "#000", emoji: "⚠️" };
  }

  return member.avatar;
}
