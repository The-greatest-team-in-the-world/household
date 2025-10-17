import * as React from "react";
import { StyleSheet } from "react-native";
import { SegmentedButtons } from "react-native-paper";

type SegmentedButtonsComponentProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export default function SegmentedButtonsComponent({
  value,
  onValueChange,
}: SegmentedButtonsComponentProps) {
  return (
    <SegmentedButtons
      value={value}
      onValueChange={onValueChange}
      density="small"
      style={styles.segmentedButtons}
      buttons={[
        {
          value: "1",
          label: "1p",
          style: styles.button,
          labelStyle: styles.label,
        },
        {
          value: "2",
          label: "2p",
          style: styles.button,
          labelStyle: styles.label,
        },
        {
          value: "4",
          label: "4p",
          style: styles.button,
          labelStyle: styles.label,
        },
        {
          value: "6",
          label: "6p",
          style: styles.button,
          labelStyle: styles.label,
        },
        {
          value: "8",
          label: "8p",
          style: styles.button,
          labelStyle: styles.label,
        },
      ]}
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
