import { db } from "@/data/mock-db";

export default function getMemberAvatar(id: string) {
  const user = db.householdMembers.find((m) => m.userId === id);

  if (!user) {
    console.warn(`Cannot find user with id: ${id}.`);
    return { color: "#000", emoji: "⚠️" };
  }

  return user.avatar;
}
