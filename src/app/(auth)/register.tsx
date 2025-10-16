import { registerUser } from "@/api/auth";
import { updateUserAtom } from "@/atoms/auth-atoms";
import { useTogglePasswordVisibility } from "@/hooks/useTogglePasswordVisibility";
import { getRegisterErrorMessage } from "@/utils/firebase-errors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuth } from "firebase/auth";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, Surface, Text, TextInput } from "react-native-paper";
import { z } from "zod";

const credentials = z
  .object({
    displayName: z
      .string({ required_error: "Namn krävs" })
      .min(1, "Skriv in ditt namn"),
    email: z
      .string({ required_error: "E-post krävs" })
      .email("Ange en giltig epost"),
    password: z
      .string({ required_error: "Lösenord krävs" })
      .min(6, "Lösenordet måste vara minst 6 tecken"),
    confirmPassword: z
      .string({ required_error: "Lösenord krävs" })
      .min(6, "Lösenordet måste vara minst 6 tecken"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Lösenorden matchar inte.",
        path: ["confirmPassword"],
      });
    }
  });

type FormFields = z.infer<typeof credentials>;

export default function RegisterScreen() {
  const { passwordVisibility, rightIcon, handlePasswordVisibility } =
    useTogglePasswordVisibility();
  const {
    passwordVisibility: confirmPasswordVisibility,
    rightIcon: confirmRightIcon,
    handlePasswordVisibility: confirmHandlePasswordVisibility,
  } = useTogglePasswordVisibility();
  const [firebaseError, setFirebaseError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(credentials),
    defaultValues: {},
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setFirebaseError("");

    const result = await registerUser(data);

    if (!result.success || !result.user) {
      const errorCode = result.error?.code || "unknown";
      setFirebaseError(getRegisterErrorMessage(errorCode));
      return;
    }

    console.log("Registrerad", result.user.email, result.user.displayName);
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <View style={styles.container}>
        <Surface style={styles.surface} elevation={4}>
          <Text style={styles.infoText}>Bli medlem!</Text>
          <Image
            source={require("../../assets/images/houseHoldTransparent.png")}
            style={styles.image}
          />
        </Surface>
        <Text style={styles.infoText}>Skapa konto</Text>
        {firebaseError && (
          <Text style={{ color: "red", padding: 10 }}>{firebaseError}</Text>
        )}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Text style={styles.inputTitle}>Namn: </Text>
              <TextInput
                placeholder="Namn"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.inputField}
                autoCapitalize="words"
              />
            </View>
          )}
          name="displayName"
        />
        {errors.displayName && <Text>{errors.displayName.message}</Text>}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Text style={styles.inputTitle}>Epost: </Text>
              <TextInput
                placeholder="Epost"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.inputField}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}
          name="email"
        />
        {errors.email && <Text>{errors.email.message}</Text>}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Text style={styles.inputTitle}>Lösenord: </Text>
              <TextInput
                placeholder="Lösenord"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.inputField}
                secureTextEntry={passwordVisibility}
                autoCapitalize="none"
              />
              <Pressable
                onPress={handlePasswordVisibility}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons
                  name={rightIcon}
                  size={20}
                  color="#232323"
                />
              </Pressable>
            </View>
          )}
          name="password"
        />
        {errors.password && <Text>{errors.password.message}</Text>}

        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Text style={styles.inputTitle}>Upprepa lösenord: </Text>
              <TextInput
                placeholder="Upprepa lösenord"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.inputField}
                secureTextEntry={confirmPasswordVisibility}
                autoCapitalize="none"
              />
              <Pressable
                onPress={confirmHandlePasswordVisibility}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons
                  name={confirmRightIcon}
                  size={22}
                  color="#232323"
                />
              </Pressable>
            </View>
          )}
          name="confirmPassword"
        />
        {errors.confirmPassword && (
          <Text>{errors.confirmPassword.message}</Text>
        )}

        <Button
          mode="contained"
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        >
          Skapa konto
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    padding: 20,
    gap: 10,
  },
  surface: {
    alignItems: "center",
    borderRadius: 20,
    padding: 10,
  },
  image: {
    height: 200,
    width: "100%",
    resizeMode: "contain",
  },
  infoText: {
    fontWeight: 700,
    fontSize: 20,
  },
  inputTitle: {
    fontWeight: "700",
  },
  inputContainer: {
    position: "relative",
  },
  inputField: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 20,
    top: 35,
  },
});
