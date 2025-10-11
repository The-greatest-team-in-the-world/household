import { userAtom } from "@/data/auth-atoms";
import { Link, router } from "expo-router";
import { useAtom } from "jotai";
import { Button, StyleSheet, Text, View } from "react-native";

// Dagsvyn, vem är inloggad? sätt current user på en atom.
// Lägg i ett globalt state med atom jotai.

export default function LoginScreen() {
  const [user, setUser] = useAtom(userAtom);

  function handleLogIn() {
    setUser({
      displayName: "",
      email: "",
      emailVerified: true,
      isAnonymous: true,
      uid: "",
      metadata: {},
      phoneNumber: "",
      photoURL: null,
      providerId: "",
      refreshToken: "",
      tenantId: null,
      providerData: [],
      delete: async () => {},
      getIdToken: async () => "",
      getIdTokenResult: async () => {
        return {
          authTime: "",
          expirationTime: "",
          claims: {},
          issuedAtTime: "",
          token: "",
          signInProvider: "",
          signInSecondFactor: "",
        };
      },
      reload: async () => {},
      toJSON: () => {
        return {};
      },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hej hej från login</Text>
      <Button title="Logga in med fakeuser" onPress={handleLogIn} />
      <Link href="/(auth)/register" push asChild>
        <Button title="/register" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  text: {
    color: "black",
  },
});
