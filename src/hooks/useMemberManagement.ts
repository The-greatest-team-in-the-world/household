import { deleteHousehold } from "@/api/households";
import {
  approveMember,
  leaveMemberFromHousehold,
  makeMemberOwner,
  rejectMember,
  removeMemberOwnership,
} from "@/api/members";
import { HouseholdMember } from "@/types/household-member";
import { getAuth } from "@firebase/auth";
import { router } from "expo-router";
import { useState } from "react";

interface DialogState {
  open: boolean;
  userId: string;
  nickName: string;
}

interface PauseDialogState {
  open: boolean;
  userId: string;
  nickName: string;
  isPaused: boolean;
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
  const [pauseDialog, setPauseDialog] = useState<PauseDialogState>({
    open: false,
    userId: "",
    nickName: "",
    isPaused: false,
  });
  const [errorDialog, setErrorDialog] = useState<ErrorDialogState>({
    open: false,
    message: "",
  });
  const [leaveHouseholdDialog, setLeaveHouseholdDialog] = useState(false);
  const [deleteHouseholdDialog, setDeleteHouseholdDialog] = useState(false);

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
    const auth = getAuth();
    const currentUserId = auth.currentUser?.uid;

    if (!currentUserId) {
      setErrorDialog({
        open: true,
        message: "Kunde inte hitta användarinformation",
      });
      return;
    }

    const activeMembers = members.filter((m) => m.status === "active");
    const isCurrentUserOwner = ownerIds?.includes(currentUserId) ?? false;

    // Check if current user is an owner and the only owner
    if (isCurrentUserOwner && ownerIds && ownerIds.length === 1) {
      if (activeMembers.length > 1) {
        // if other members - show error ownership must be transferred
        setErrorDialog({
          open: true,
          message:
            "Du är den enda ägaren. Du måste först göra någon annan medlem till ägare innan du kan lämna hushållet.",
        });
        return;
      } else if (activeMembers.length === 1) {
        // User is only member - show delete household dialog
        setDeleteHouseholdDialog(true);
        return;
      }
    }

    setLeaveHouseholdDialog(true);
  };

  const confirmLeaveHousehold = async () => {
    if (!householdId) return;

    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      setErrorDialog({
        open: true,
        message: "Kunde inte hitta användarinformation",
      });
      return;
    }

    setLeaveHouseholdDialog(false);

    const result = await leaveMemberFromHousehold(householdId, userId);

    if (result.success) {
      // Navigate back to index - real-time listener will update atoms automatically
      router.dismissTo("/(protected)");
    } else {
      setErrorDialog({
        open: true,
        message:
          result.error || "Ett fel uppstod när du försökte lämna hushållet",
      });
    }
  };

  const confirmDeleteHousehold = async () => {
    if (!householdId) return;

    setDeleteHouseholdDialog(false);

    const result = await deleteHousehold(householdId);

    if (result.success) {
      // Navigate back to index - real-time listener will update atoms automatically
      router.dismissTo("/(protected)");
    } else {
      setErrorDialog({
        open: true,
        message: result.error || "Ett fel uppstod vid radering av hushållet",
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
    handleLeaveHousehold,
    leaveHouseholdDialog,
    setLeaveHouseholdDialog,
    confirmLeaveHousehold,
    deleteHouseholdDialog,
    setDeleteHouseholdDialog,
    confirmDeleteHousehold,
  };
}
