import { EmailAuthProvider, getAuth, reauthenticateWithCredential } from "@firebase/auth";
import { useState } from "react";

type ReauthModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
};

export function ReauthModal({visible, onDismiss, onSuccess }: ReauthModalProps) {
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setErrorText] = useState("");

    async function handleConfirm() {
        setSubmitting(true);
        setErrorText("");

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user || !user.email) {
                setErrorText("Användaren är inte inloggad.");
                setSubmitting(false);
                return;
            }

            const credential = EmailAuthProvider.credential(user.email, password);

            await reauthenticateWithCredential(user, credential);

            setSubmitting(false);
            setPassword("");
            onSuccess();
        }
        catch (error: any) {
            setSubmitting(false);
            setErrorText("Autentisering misslyckades. Kontrollera ditt lösenord och försök igen.");
        }
    }

    return (null); // Placeholder for modal UI
}

