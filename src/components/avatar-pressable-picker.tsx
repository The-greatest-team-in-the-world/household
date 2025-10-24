import { Avatar } from "@/types/household-member";
import { Dimensions, FlatList, Pressable, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface AvatarPressableProps {
  value: Avatar | undefined;
  onChange: (value: Avatar) => void;
  avatars: Avatar[];
}

export const AvatarPressablePicker = ({
  onChange,
  value,
  avatars,
}: AvatarPressableProps) => {
  const SCREEN_WIDTH = Dimensions.get("window").width;
  const BUTTON_SIZE = (SCREEN_WIDTH - 80) / 4;
  const theme = useTheme();

  return (
    <FlatList
      data={avatars}
      numColumns={4}
      keyExtractor={(e) => e.emoji}
      renderItem={(renderItem) => (
        <Pressable
          style={[
            {
              backgroundColor: renderItem.item.color,
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
            },
            // Om en avatar är vald OCH det inte är denna → tona ner
            value &&
              value.emoji !== renderItem.item.emoji && {
                opacity: 0.3,
              },
            value &&
              value.emoji === renderItem.item.emoji && {
                borderWidth: 2,
                borderColor: theme.colors.onBackground,
              },
          ]}
          onPress={() => onChange(renderItem.item)}
        >
          <Text style={s.avatarEmoji}>{renderItem.item.emoji}</Text>
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
