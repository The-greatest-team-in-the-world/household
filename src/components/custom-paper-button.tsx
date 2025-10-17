import React from "react";
import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { Button } from "react-native-paper";

interface CustomPaperButtonProps {
  icon: string;
  text: string;
  color: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const CustomPaperButton = ({
  icon,
  text,
  color,
  onPress,
  style,
  disabled = false,
}: CustomPaperButtonProps) => {
  return (
    <Button
      mode="contained"
      icon={icon}
      buttonColor={color}
      onPress={onPress}
      disabled={disabled}
      style={[{ margin: 10, borderRadius: 8, minWidth: 100 }, style]}
      contentStyle={{ paddingVertical: 8 }}
    >
      <Text style={s.buttonText}>{text}</Text>
    </Button>
  );
};

const s = StyleSheet.create({
  buttonText: {
    fontSize: 18,
  },
});
