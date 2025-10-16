import { avatarColors } from "@/data/avatar-index";
import { Dimensions, FlatList, Pressable, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

interface AvatarPressableProps {
  value: string;
  onChange: (value: string) => void;
}

//https://reactnative.dev/docs/dimensions + gippy, kolla upp mer!
const SCREEN_WIDTH = Dimensions.get("window").width;
const BUTTON_SIZE = (SCREEN_WIDTH - 80) / 4; // 80 = padding + margins

export const AvatarPressablePicker = ({
  onChange,
  value,
}: AvatarPressableProps) => {
  return (
    <FlatList
      data={Object.entries(avatarColors)}
      numColumns={4}
      keyExtractor={([emoji]) => emoji}
      renderItem={({ item: [emoji, color] }) => (
        <Pressable
          style={[
            {
              backgroundColor: color,
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
            },
            // Om en avatar är vald OCH det inte är denna → tona ner
            value &&
              value !== emoji && {
                opacity: 0.3,
              },
          ]}
          onPress={(e) => {
            onChange(emoji);
          }}
        >
          <Text style={s.avatarEmoji}>{emoji}</Text>
        </Pressable>
      )}
      columnWrapperStyle={s.row}
      scrollEnabled={false}
    />
  );
};

const s = StyleSheet.create({
  avatarEmoji: {
    fontSize: 50,
  },
  row: {
    justifyContent: "flex-start",
    gap: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});
