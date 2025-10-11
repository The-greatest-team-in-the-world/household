import { Link } from "expo-router";
import { View, Text, Button } from "react-native";

export default function HouseholdsScreen() {
  return (
    <View>
      <Text>hej från protected/index, households</Text>
      <Link href="/(protected)/day-view" push asChild>
        <Button title="Day-view" />
      </Link>
    </View>
  );
}
