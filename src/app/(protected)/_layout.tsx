import { authStateAtom } from "@/atoms/auth-atoms";
import { Redirect, Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { useTheme } from "react-native-paper";

export default function ProtectedLayout() {
  const authState = useAtomValue(authStateAtom);
  const theme = useTheme();

  if (authState.isLoading) return;

  if (!authState.isAuthenticated) {
    return <Redirect href="../(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(top-tabs)" />
      <Stack.Screen name="chore-details" />
      <Stack.Screen name="create-chore" />
      <Stack.Screen
        name="create-household"
        options={{
          title: "Skapa hushåll",
        }}
      />
      <Stack.Screen
        name="join-household"
        options={{ title: "Anslut till hushåll" }}
      />
      <Stack.Screen name="user-profile" />
    </Stack>
  );
}
