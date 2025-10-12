import { signOutAtom, userAtom } from "@/data/auth-atoms";
import { Link, router } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import { StyleSheet, Text, View } from "react-native";
import { Button, Surface } from "react-native-paper";

export default function HouseholdsScreen() {
  const signOut = useSetAtom(signOutAtom);
  const user = useAtom(userAtom);

  const onSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Kunde inte logga ut:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface} elevation={4}>
        <Text>Hej {user[0]?.displayName}</Text>
        <Text>Epost: {user[0]?.email} från households/protected</Text>
      </Surface>
      <View style={styles.buttonGroup}>
        <Link href="/(protected)/day-view" push asChild>
          <Button style={styles.button}>Day-view</Button>
        </Link>
        <Button style={styles.button} onPress={onSignOut}>
          Sign out
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    flex: 1,
  },
  surface: {
    borderRadius: 20,
    padding: 10,
    flex: 1,
  },
  buttonGroup: {
    padding: 15,
    gap: 10,
  },
  button: {
    backgroundColor: "lightgrey",
    textDecorationColor: "none",
  },
});
