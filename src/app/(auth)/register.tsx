import { Link, router } from "expo-router";
import { View, Text, Button, StyleSheet } from "react-native";

// Dagsvyn, vem är inloggad? sätt current user på en atom.
// Lägg i ett globalt state med atom jotai.

export default function RegisterScreen() {
  return (
    <View>
      <Text>Hej från register</Text>
      <Link href="/(protected)/day-view" push asChild>
        <Button title="Day-view" />
      </Link>
      <Link href="/(auth)/login" push asChild>
        <Button title="loginScreen" />
      </Link>
    </View>
  );
}
