import {
  approveMember,
  makeMemberOwner,
  rejectMember,
  removeMemberOwnership,
} from "@/api/members";
import { HouseholdMember } from "@/types/household-member";
import { useState } from "react";

interface DialogState {
  open: boolean;
  userId: string;
  nickName: string;
}

interface ErrorDialogState {
  open: boolean;
  message: string;
}

export function useMemberManagement(
  householdId: string | undefined,
  members: HouseholdMember[],
  ownerIds: string[] | undefined,
) {
  const [makeOwnerDialog, setMakeOwnerDialog] = useState<DialogState>({
    open: false,
    userId: "",
    nickName: "",
  });
  const [removeOwnerDialog, setRemoveOwnerDialog] = useState<DialogState>({
    open: false,
    userId: "",
    nickName: "",
  });
  const [errorDialog, setErrorDialog] = useState<ErrorDialogState>({
    open: false,
    message: "",
  });
  const [leaveHouseholdDialog, setLeaveHouseholdDialog] = useState(false);

  const handleApprove = async (userId: string) => {
    if (!householdId) return;

    try {
      await approveMember(householdId, userId);
    } catch (error) {
      console.error("Error approving member:", error);
    }
  };

  const handleReject = async (userId: string) => {
    if (!householdId) return;

    try {
      await rejectMember(householdId, userId);
    } catch (error) {
      console.error("Error rejecting member:", error);
    }
  };

  const handleMakeOwner = (userId: string) => {
    const member = members.find((m) => m.userId === userId);
    if (!member) return;

    setMakeOwnerDialog({
      open: true,
      userId: userId,
      nickName: member.nickName,
    });
  };

  const confirmMakeOwner = async () => {
    if (!householdId) return;

    setMakeOwnerDialog({ open: false, userId: "", nickName: "" });

    const result = await makeMemberOwner(householdId, makeOwnerDialog.userId);

    if (!result.success) {
      setErrorDialog({
        open: true,
        message: result.error || "Ett fel uppstod vid tilldelning av ägarskap",
      });
    }
  };

  const handleRemoveOwnership = (userId: string) => {
    const member = members.find((m) => m.userId === userId);
    if (!member) return;

    setRemoveOwnerDialog({
      open: true,
      userId: userId,
      nickName: member.nickName,
    });
  };

  const confirmRemoveOwnership = async () => {
    if (!householdId) return;

    setRemoveOwnerDialog({ open: false, userId: "", nickName: "" });

    const result = await removeMemberOwnership(
      householdId,
      removeOwnerDialog.userId,
    );

    if (!result.success) {
      setErrorDialog({
        open: true,
        message: result.error || "Ett fel uppstod vid borttagning av ägare",
      });
    }
  };

  const handleLeaveHousehold = () => {
    const activeMembers = members.filter((m) => m.status === "active");

    // Check if user is the only owner
    if (ownerIds && ownerIds.length === 1) {
      // User is the only owner
      if (activeMembers.length > 1) {
        // There are other members - show error that ownership must be transferred
        setErrorDialog({
          open: true,
          message:
            "Du är den enda ägaren. Du måste först göra någon annan medlem till ägare innan du kan lämna hushållet.",
        });
        return;
      }
    }

    setLeaveHouseholdDialog(true);
  };

  const confirmLeaveHousehold = async () => {
    // TODO: Call API to set member status to "left"
    setLeaveHouseholdDialog(false);
  };

  return {
    handleApprove,
    handleReject,
    handleMakeOwner,
    handleRemoveOwnership,
    makeOwnerDialog,
    setMakeOwnerDialog,
    confirmMakeOwner,
    removeOwnerDialog,
    setRemoveOwnerDialog,
    confirmRemoveOwnership,
    errorDialog,
    setErrorDialog,
    handleLeaveHousehold,
    leaveHouseholdDialog,
    setLeaveHouseholdDialog,
    confirmLeaveHousehold,
  };
}
