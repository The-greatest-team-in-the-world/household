import { userAtom } from "@/atoms/auth-atoms";
import { userThemeAtom } from "@/atoms/theme-atom";
import { shouldRenderSlideAtom, slideVisibleAtom } from "@/atoms/ui-atom";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  Divider,
  IconButton,
  List,
  Portal,
  SegmentedButtons,
  Text,
  useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomPaperButton } from "./custom-paper-button";

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
  const displayName = user?.displayName?.trim();
  const insets = useSafeAreaInsets();
  const [userTheme, setUserTheme] = useAtom(userThemeAtom);
  const theme = useTheme();

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
            { backgroundColor: theme.colors.backdrop },
          ]}
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateX: slide }],
            top: insets.top,
            bottom: insets.bottom,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <View
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 6,
            marginBottom: 16,
          }}
        >
          <View style={styles.topRow}>
            <IconButton icon="close" onPress={onClose} />
          </View>

          <View style={styles.header}>
            <View>
              <Text variant="titleLarge" style={{ fontWeight: "600" }}>
                {" "}
                Inställningar
              </Text>
              {displayName && (
                <Text variant="bodyLarge" style={{ marginTop: 4, margin: 10 }}>
                  {displayName}
                </Text>
              )}
            </View>
          </View>
        </View>
        <Divider />
        <View style={{ flex: 1, padding: 8 }}>
          <List.Section>
            <List.Item
              title="Tema"
              titleStyle={{
                fontWeight: "600",
                fontSize: 18,
                color: theme.colors.onSurface,
              }}
              right={(props) => (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                  }}
                >
                  <MaterialCommunityIcons
                    name="brightness-6"
                    size={25}
                    color={theme.colors.onSurfaceVariant}
                    style={{ marginRight: 2 }}
                  />
                </View>
              )}
            />
            <View>
              <SegmentedButtons
                value={userTheme}
                onValueChange={(v: string) =>
                  setUserTheme(v as "light" | "dark" | "auto")
                }
                density="small"
                // Build buttons dynamically so we can set a checked background using theme colors
                buttons={["light", "dark", "auto"].map((val) => ({
                  value: val,
                  label:
                    val === "auto"
                      ? "Auto"
                      : val.charAt(0).toUpperCase() + val.slice(1),
                  // use theme primaryContainer for checked background and onPrimaryContainer for label color
                  style: [
                    { flex: 1, minWidth: 0 },
                    userTheme === val
                      ? {
                          backgroundColor: (theme.colors as any).primary,
                        }
                      : undefined,
                  ],
                  labelStyle:
                    userTheme === val
                      ? { color: (theme.colors as any).onPrimary } // text färg för vald
                      : { color: theme.colors.onSurface },
                }))}
              />
            </View>
          </List.Section>
        </View>
        <Divider />

        <View style={{ paddingTop: 16, paddingBottom: insets.bottom }}>
          <CustomPaperButton
            mode="outlined"
            text="Logga ut"
            style={styles.actionButton}
            icon="logout"
            onPress={() => {
              onLogout?.();
            }}
          ></CustomPaperButton>
          <CustomPaperButton
            mode="text"
            text="Avsluta konto"
            style={[styles.actionButton, { marginTop: 8 }]}
            icon="delete-outline"
            onPress={() => {
              onDelete?.();
            }}
          ></CustomPaperButton>
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
    padding: 16,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
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
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  actionButton: {
    borderRadius: 10,
    justifyContent: "center",
  },
});
