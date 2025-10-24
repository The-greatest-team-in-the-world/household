import { updateStatusOnHouseholdMember } from "@/api/members";
import { useState } from "react";

export default function UseUserStatus() {
  const [isLoading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function updateUserStatus(
    status: string,
    householdId: string,
    userId: string,
  ) {
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await updateStatusOnHouseholdMember(
        status,
        householdId,
        userId,
      );

      if (result.success) {
        setErrorMessage(null);
        setIsDialogOpen(true);
      } else {
        setErrorMessage(result.error || "Uppdateringen misslyckades.");
      }
    } catch (error) {
      console.error("Error updating user status", error);
      setErrorMessage(
        "Kunde inte uppdatera användarstatus. Försök igen senare.",
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    isLoading,
    errorMessage,
    isDialogOpen,
    setIsDialogOpen,
    updateUserStatus,
  };
}
