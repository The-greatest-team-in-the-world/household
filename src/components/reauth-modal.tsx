import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
} from "@firebase/auth";
import { useState } from "react";
import { Dialog, Portal, Text, TextInput } from "react-native-paper";
import { CustomPaperButton } from "./custom-paper-button";

type ReauthModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
};

export function ReauthModal({
  visible,
  onDismiss,
  onSuccess,
}: ReauthModalProps) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

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
    } catch (error: any) {
      console.error(error);
      setSubmitting(false);
      setErrorText(
        "Autentisering misslyckades. Kontrollera ditt lösenord och försök igen.",
      );
    }
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{ zIndex: 999 }}>
        <Dialog.Title>Bekräfta identitet</Dialog.Title>
        <Dialog.Content>
          <Text style={{ marginBottom: 8 }}>
            För att avsluta kontot måste du bekräfta ditt lösenord.
          </Text>

          <TextInput
            label="Lösenord"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            disabled={submitting}
          />

          {errorText ? (
            <Text style={{ color: "red", marginTop: 8 }}>{errorText}</Text>
          ) : null}
        </Dialog.Content>

        <Dialog.Actions>
          <CustomPaperButton
            text="Avbryt"
            mode="contained"
            onPress={onDismiss}
            disabled={submitting}
          />
          <CustomPaperButton
            text="Bekräfta"
            mode="contained"
            onPress={handleConfirm}
          />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
