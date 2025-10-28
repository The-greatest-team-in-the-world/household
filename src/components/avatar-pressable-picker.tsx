import { Avatar } from "@/types/household-member";
import { Pressable, StyleSheet, View } from "react-native";
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
  const theme = useTheme();

  return (
    <View style={s.container}>
      {avatars.map((item) => (
        <Pressable
          key={item.emoji}
          style={[
            s.avatarButton,
            { backgroundColor: item.color },
            // Om en avatar är vald OCH det inte är den valda → tona ner
            value && value.emoji !== item.emoji && { opacity: 0.3 },
            value &&
              value.emoji === item.emoji && {
                borderWidth: 4,
                borderColor: theme.colors.onBackground,
              },
          ]}
          onPress={() => onChange(item)}
        >
          <Text style={s.avatarEmoji}>{item.emoji}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
    gap: 7,
  },
  avatarEmoji: {
    fontSize: 50,
  },
  avatarButton: {
    borderRadius: 10,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
});
