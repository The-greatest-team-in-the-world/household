import { db } from "@/data/mock-db";

export default function getMemberAvatar(id: string) {
  const member = db.householdMembers.find((m) => m.userId === id);
  if (!member) {
    console.warn(`Cannot find household member with id: ${id}.`);
    return { color: "#000", emoji: "⚠️" };
  }
  return member.avatar;
}
