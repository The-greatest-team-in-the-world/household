// export default function getMemberAvatar(id: string) {
//   const member = db.householdMembers.find((m) => m.id === id);
//   if (!member) {
//     console.warn(`Cannot find household member with id: ${id}.`);
//     return { color: "#000", emoji: "⚠️" };
//   }
//   return member.avatar;
// }

import { HouseholdMember } from "@/types/household-member";

export default function getMemberAvatar(
  members: HouseholdMember[] | undefined,
  userId: string
) {
  if (!members || members.length === 0) {
    return { color: "#000", emoji: "⚠️" };
  }

  const member = members.find((m) => m.userId === userId);

  if (!member) {
    console.warn(`Cannot find household member with userId: ${userId}`);
    return { color: "#000", emoji: "⚠️" };
  }

  return member.avatar;
}
