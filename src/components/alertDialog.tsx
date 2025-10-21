import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";

interface Props extends React.PropsWithChildren {
  open: boolean;
  onClose: () => void;
  headLine: string;
  alertMsg: string;
  agreeText: string;
  secondOption?: string;
  disagreeText?: string;
  agreeAction?: () => void;
  secondOptionAction?: () => void;
  disagreeAction?: () => void;
}

export default function AlertDialog(props: Props) {
  const handleAgree = () => {
    props.agreeAction && props.agreeAction();
    props.onClose();
  };

  const handleDisagree = () => {
    props.disagreeAction && props.disagreeAction();
    props.onClose();
  };

  return (
    <Portal>
      {props.open && (
        <BlurView
          intensity={20}
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
      )}
      <Dialog visible={props.open} onDismiss={props.onClose} style={s.dialog}>
        <Dialog.Title>
          <Text>{props.headLine}</Text>
        </Dialog.Title>
        <Dialog.Content>
          <Text>{props.alertMsg}</Text>
        </Dialog.Content>
        <Dialog.Actions style={{ justifyContent: "space-between" }}>
          {props.disagreeText && (
            <Button
              onPress={handleDisagree}
              labelStyle={{ fontSize: 17 }}
              contentStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}
            >
              {props.disagreeText}
            </Button>
          )}
          {props.secondOption && (
            <Button
              onPress={props.secondOptionAction}
              labelStyle={{ fontSize: 17 }}
              contentStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}
            >
              {props.secondOption}
            </Button>
          )}
          <Button
            onPress={handleAgree}
            labelStyle={{ fontSize: 17 }}
            contentStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}
          >
            {props.agreeText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const s = StyleSheet.create({
  dialog: {
    borderRadius: 10,
  },
});
