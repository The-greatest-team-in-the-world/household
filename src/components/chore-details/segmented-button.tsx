import * as React from "react";
import { StyleSheet } from "react-native";
import { SegmentedButtons, useTheme } from "react-native-paper";

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
  const theme = useTheme();

  return (
    <SegmentedButtons
      value={value}
      onValueChange={onValueChange}
      density="small"
      style={styles.segmentedButtons}
      buttons={options.map(({ value: optionValue, label }) => ({
        value: optionValue,
        label,
        style: [
          { flex: 1, minWidth: 0 },
          value === optionValue
            ? {
                backgroundColor: (theme.colors as any).primary,
              }
            : undefined,
        ],
        labelStyle:
          value === optionValue
            ? { color: (theme.colors as any).onPrimary }
            : { color: theme.colors.onSurface },
      }))}
    />
  );
}

const styles = StyleSheet.create({
  segmentedButtons: {
    width: "100%",
  },
});
