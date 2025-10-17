import * as React from "react";
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
      buttons={[
        { value: "1", label: "1p" },
        { value: "2", label: "2p" },
        { value: "4", label: "4p" },
        { value: "6", label: "6p" },
        { value: "8", label: "8p" },
      ]}
    />
  );
}
