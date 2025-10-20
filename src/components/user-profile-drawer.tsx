import { currentHouseholdMember } from "@/atoms/member-atom";
import { drawerVisibleAtom, shouldRenderDrawerAtom } from "@/atoms/ui-atom";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Button, Drawer, IconButton, Portal, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  onLogout?: () => void;
  onDelete?: () => void;
};

const { width } = Dimensions.get("window");

export default function SettingsSideSheet({
  onClose,
  onLogout,
  onDelete,
}: Props) {
  // mounta bara när vi behöver visa/animera
    const visible = useAtomValue(drawerVisibleAtom);
    const setShouldRender = useSetAtom(shouldRenderDrawerAtom);
    const slide = useRef(new Animated.Value(width)).current;
    const fade = useRef(new Animated.Value(0)).current;
    const member = useAtomValue(currentHouseholdMember);
    const insets = useSafeAreaInsets();
  
    useEffect(() => {
      slide.stopAnimation();
      fade.stopAnimation();
  
      if (visible) {
        setShouldRender(true);

        slide.setValue(width);
        fade.setValue(0);

        Animated.parallel([
          Animated.timing(fade, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(slide, {
            toValue: 0,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(fade, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(slide, {
            toValue: width,
            duration: 240,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => setShouldRender(false));
      }
    }, [visible, fade, slide]);
  
    if (!setShouldRender) return null;

  return (
    <Portal>
      <Animated.View
        pointerEvents="box-none"
        style={[StyleSheet.absoluteFill, { opacity: fade }]}
      >
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.35)" },
          ]}
          onPress={onClose}
        />
      </Animated.View>

      {/* Själva “drawern” */}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateX: slide }],
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <View style={styles.topRow}>
          <IconButton icon="close" onPress={onClose} />
        </View>

        <View style={styles.header}>
          <View style={{ marginLeft: 12 }}>
            <Text variant="titleMedium" style={{ fontWeight: "600" }}>
              {member?.nickName || "Användarnamn"}
            </Text>
          </View>
        </View>

        <Drawer.Section title="Inställningar">
          <Drawer.Item
            icon="theme-light-dark"
            label="Tema"
            onPress={() => {}}
          />
        </Drawer.Section>

        <View style={{ flex: 1 }} />

        <Button
          mode="contained"
          buttonColor="#beafafff"
          style={styles.danger}
          icon="logout"
          onPress={onLogout}
        >
          Logga ut
        </Button>
        <Button
          mode="contained"
          buttonColor="#beafafff"
          style={[styles.danger, { marginTop: 8 }]}
          icon="delete-outline"
          onPress={onDelete}
        >
          Avsluta konto
        </Button>
      </Animated.View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  topRow: { alignItems: "flex-end" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  danger: { borderRadius: 10, justifyContent: "center" },
});
