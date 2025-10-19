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
  { value: "1", label: "1p" },
  { value: "2", label: "2p" },
  { value: "4", label: "4p" },
  { value: "6", label: "6p" },
  { value: "8", label: "8p" },
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
