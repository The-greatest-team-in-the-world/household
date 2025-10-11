import { authStateAtom } from "@/data/auth-atoms";
import { Redirect, Stack } from "expo-router";
import { useAtomValue } from "jotai";

export default function ProtectedLayout() {
  const authState = useAtomValue(authStateAtom);

  if (authState.isLoading) return;

  if (!authState.isAuthenticated) {
    return <Redirect href="../(auth)/login" />;
  }

  return <Stack />;
}
