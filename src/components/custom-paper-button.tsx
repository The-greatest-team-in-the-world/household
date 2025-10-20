import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Button } from "react-native-paper";
import { Text } from "react-native-paper";

interface CustomPaperButtonProps {
  icon?: string;
  text?: string;
  color?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  mode: "text" | "outlined" | "contained" | "elevated" | "contained-tonal";
  // Toggle-funktionalitet
  isToggle?: boolean;
  isToggled?: boolean;
  toggledIcon?: string;
  toggledText?: string;
  toggledMode?:
    | "text"
    | "outlined"
    | "contained"
    | "elevated"
    | "contained-tonal";
}

export const CustomPaperButton = ({
  icon,
  text,
  color,
  onPress,
  style,
  disabled = false,
  mode,
  isToggle = false,
  isToggled = false,
  toggledIcon,
  toggledText,
  toggledMode,
}: CustomPaperButtonProps) => {
  // Bestäm vilken ikon, text och mode som ska användas baserat på toggle-state
  const currentIcon = isToggle && isToggled ? toggledIcon || icon : icon;
  const currentText = isToggle && isToggled ? toggledText || text : text;
  const currentMode = isToggle && isToggled ? toggledMode || mode : mode;

  return (
    <Button
      mode={currentMode}
      icon={currentIcon}
      buttonColor={color}
      onPress={onPress}
      disabled={disabled}
      style={[{ borderRadius: 8, minWidth: 100 }, style]}
      contentStyle={{ paddingVertical: 8 }}
    >
      <Text style={s.buttonText}>{currentText}</Text>
    </Button>
  );
};

const s = StyleSheet.create({
  buttonText: {
    fontSize: 18,
  },
});
