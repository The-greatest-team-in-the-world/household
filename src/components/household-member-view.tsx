import { HouseholdMember } from "@/types/household-member";
import { MemberList } from "./member-list";

interface HouseholdMemberViewProps {
  members: HouseholdMember[];
  householdName: string;
  householdCode: string;
}

export function HouseholdMemberView({
  members,
  householdName,
  householdCode,
}: HouseholdMemberViewProps) {
  return (
    <MemberList
      members={members}
      householdName={householdName}
      householdCode={householdCode}
    />
  );
}
