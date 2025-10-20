import { userAtom } from "@/atoms/auth-atoms";
import { shouldRenderSlideAtom, slideVisibleAtom } from "@/atoms/ui-atom";
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
import { Button, IconButton, List, Portal, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
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
  const visible = useAtomValue(slideVisibleAtom);
  const shouldRender = useAtomValue(shouldRenderSlideAtom);
  const setShouldRender = useSetAtom(shouldRenderSlideAtom);
  const slide = useRef(new Animated.Value(width)).current;
  const fade = useRef(new Animated.Value(0)).current;
   const user = useAtomValue(userAtom);
  const displayName =
    user?.displayName?.trim()
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
  }, [visible, fade, slide, setShouldRender]);

  if (!shouldRender) return null;

  return (
    <Portal>
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
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

      {/* Side Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateX: slide }],
            top: insets.top,
          },
        ]}
      >
        {/* Top section */}
        <View>
          <View style={styles.topRow}>
            <IconButton icon="close" onPress={onClose} />
          </View>

          <View style={styles.header}>
            <View style={{ marginLeft: 12 }}>
              <Text variant="titleMedium" style={{ fontWeight: "600" }}>
                {displayName || "Användarnamn"}
              </Text>
            </View>
          </View>
        </View>

        {/* Scrollable content */}
        <View style={{ flex: 1 }}>
          <List.Section>
            <List.Subheader>Inställningar</List.Subheader>
            <List.Item
              title="Tema"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </List.Section>
        </View>

        <View style={{ paddingBottom: insets.bottom }}>
          <Button
            mode="contained"
            buttonColor="#f5f5f5"
            textColor="#666"
            style={styles.actionButton}
            icon="logout"
            onPress={onLogout}
          >
            Logga ut
          </Button>
          <Button
            mode="text"
            textColor="#2f37d3ff"
            style={[styles.actionButton, { marginTop: 8 }]}
            icon="delete-outline"
            onPress={onDelete}
          >
            Avsluta konto
          </Button>
        </View>
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
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  topRow: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 10,
    justifyContent: "center",
  },
});
