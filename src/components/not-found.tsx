import LottieView from "lottie-react-native";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

interface Props {
  title: string;
  subTitle: string;
}

export default function NotFound({ title, subTitle }: Props) {
  return (
    <View style={s.noChoresContainer}>
      <LottieView
        source={require("../assets/animations/Tumbleweed.json")}
        autoPlay
        style={s.lottie}
      />
      <Text style={[s.text, s.title]}>{title}</Text>
      <Text style={s.text}>{subTitle}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  noChoresContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
  },
  text: {
    textAlign: "center",
    minWidth: 50,
    maxWidth: 250,
    paddingTop: 15,
  },
  lottie: {
    width: 300,
    height: 150,
    alignSelf: "center",
    marginBottom: 35,
  },
});
