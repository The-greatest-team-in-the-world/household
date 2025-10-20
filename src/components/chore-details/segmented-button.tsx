import * as React from "react";
import { StyleSheet } from "react-native";
import { SegmentedButtons } from "react-native-paper";

type SegmentOption = {
  value: string;
  label: string;
};

type SegmentedButtonsComponentProps = {
  value: string;
  onValueChange: (value: string) => void;
  options?: SegmentOption[];
};

const DEFAULT_OPTIONS: SegmentOption[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "4", label: "4" },
  { value: "6", label: "6" },
  { value: "8", label: "8" },
];

export default function SegmentedButtonsComponent({
  value,
  onValueChange,
  options = DEFAULT_OPTIONS,
}: SegmentedButtonsComponentProps) {
  return (
    <SegmentedButtons
      value={value}
      onValueChange={onValueChange}
      density="small"
      style={styles.segmentedButtons}
      buttons={options.map(({ value: optionValue, label }) => ({
        value: optionValue,
        label,
        style: styles.button,
        labelStyle: styles.label,
      }))}
    />
  );
}

const styles = StyleSheet.create({
  segmentedButtons: {
    width: "100%",
  },
  button: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 12,
  },
});
