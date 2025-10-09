import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function LoginScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Välkommen!</Text>
      <Link
        href="/day-view"
        style={{
          marginTop: 16,
          color: "blue",
          textDecorationLine: "underline",
        }}
      >
        Go to Day View
      </Link>
    </View>
  );
}
