import { signOutAtom, userAtom } from "@/data/auth-atoms";
import { Link, router } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

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
    <View>
      <Text>hej {user[0]?.email} protected/index, households</Text>
      <Link href="/(protected)/day-view" push asChild>
        <Button style={styles.button}>Day-view</Button>
      </Link>
      <Button style={styles.button} onPress={onSignOut}>
        Sign out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 5,
    backgroundColor: "lightgrey",
    textDecorationColor: "none",
  },
});
