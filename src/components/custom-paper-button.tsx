import React from "react";
import { StyleSheet, Text } from "react-native";
import { Button } from "react-native-paper";

interface CustomPaperButtonProps {
  icon: string;
  text: string;
  color: string;
  onPress?: () => void;
}

export const CustomPaperButton = ({
  icon,
  text,
  color,
  onPress,
}: CustomPaperButtonProps) => {
  return (
    <Button
      mode="contained"
      icon={icon}
      buttonColor={color}
      onPress={onPress}
      style={{ margin: 10, borderRadius: 8, minWidth: 100 }}
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
