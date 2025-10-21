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
  };
}
