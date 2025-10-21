import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Button, useTheme } from "react-native-paper";

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
  const theme = useTheme();

  // Bestäm vilken ikon, text och mode som ska användas baserat på toggle-state
  const currentIcon = isToggle && isToggled ? toggledIcon || icon : icon;
  const currentText = isToggle && isToggled ? toggledText || text : text;
  const currentMode = isToggle && isToggled ? toggledMode || mode : mode;

  // Use theme colors if no color is provided
  const buttonColor = color || theme.colors.primary;

  return (
    <Button
      mode={currentMode}
      icon={currentIcon}
      buttonColor={buttonColor}
      onPress={onPress}
      disabled={disabled}
      style={[{ borderRadius: 8, minWidth: 100 }, style]}
      contentStyle={{ paddingVertical: 8 }}
      labelStyle={s.buttonText}
    >
      {currentText}
    </Button>
  );
};

const s = StyleSheet.create({
  buttonText: {
    fontSize: 18,
  },
});
