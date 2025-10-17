import { authStateAtom } from "@/atoms/auth-atoms";
import { db } from "@/data/mock-db";
import { Redirect, Stack } from "expo-router";
import { useAtomValue } from "jotai";

export default function ProtectedLayout() {
  const authState = useAtomValue(authStateAtom);

  if (authState.isLoading) return;

  if (!authState.isAuthenticated) {
    return <Redirect href="../(auth)/login" />;
  }

  const household = db.households.find((h) => h.id === "house-ankeborg");

  if (!household) return null;

  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="(top-tabs)" />
      <Stack.Screen name="chore-details" />
      <Stack.Screen name="create-chore" />
      <Stack.Screen name="create-household" />
      <Stack.Screen name="join-household" />
      <Stack.Screen name="user-profile" />
    </Stack>
  );
}
