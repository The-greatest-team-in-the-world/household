import { authStateAtom } from "@/atoms/auth-atoms";
import { currentHouseholdAtom } from "@/atoms/household-atom";
import { HouseholdHeader } from "@/components/household-header";
import { Redirect, Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { Text, useTheme } from "react-native-paper";

export default function ProtectedLayout() {
  const authState = useAtomValue(authStateAtom);
  const currentHousehold = useAtomValue(currentHouseholdAtom);
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
      <Stack.Screen
        name="index"
        options={{ title: "Hushåll", headerShown: false }}
      />
      <Stack.Screen
        name="(top-tabs)"
        options={{
          title: "Översikt",
          headerTitle: () => (
            <Text variant="titleLarge" numberOfLines={1}>
              {currentHousehold?.name || ""}
            </Text>
          ),
          headerRight: () => <HouseholdHeader />,
        }}
      />
      <Stack.Screen name="chore-details" options={{ title: "Detaljer" }} />
      <Stack.Screen name="create-chore" options={{ title: "Skapa syssla" }} />
      <Stack.Screen
        name="create-household"
        options={{
          title: "Skapa hushåll",
        }}
      />
      <Stack.Screen
        name="join-household"
        options={{ title: "Gå med i hushåll" }}
      />
      <Stack.Screen
        name="household-details"
        options={{ title: "Hushållsdetaljer" }}
      />
    </Stack>
  );
}
