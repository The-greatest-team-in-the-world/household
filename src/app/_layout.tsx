import { authStateAtom, initAuthAtom } from "@/atoms/auth-atoms";
import { ThemeProvider } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppDarkTheme, AppDefaultTheme } from "../../theme";

// https://docs.expo.dev/router/basics/common-navigation-patterns/#authenticated-users-only-protected-routes

NavigationBar.setButtonStyleAsync("dark");

export default function RootLayout() {
  const [authState] = useAtom(authStateAtom);
  const initAuth = useSetAtom(initAuthAtom);
  const colorScheme = useColorScheme();

  const theme = colorScheme === "dark" ? AppDarkTheme : AppDefaultTheme;

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authState.isLoading) {
    return (
      <PaperProvider>
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <StatusBar style="auto" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider value={theme}>
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={authState.isAuthenticated}>
              <Stack.Screen name="(protected)" />
            </Stack.Protected>
            <Stack.Protected guard={!authState.isAuthenticated}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
          </Stack>
        </SafeAreaView>
      </ThemeProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightgrey",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
