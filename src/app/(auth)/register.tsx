import { registerUser } from "@/api/auth";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { useTogglePasswordVisibility } from "@/hooks/useTogglePasswordVisibility";
import { getRegisterErrorMessage } from "@/utils/firebase-errors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Surface, Text, TextInput, useTheme } from "react-native-paper";
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
      .string({ required_error: "Upprepa ditt lösenord" })
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
  const theme = useTheme();

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
      contentContainerStyle={s.scrollContent}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <View style={s.container}>
        <Surface style={s.surface} elevation={4}>
          <Text style={s.infoText}>Bli medlem!</Text>
          <Image
            source={require("../../assets/images/cleanTeam.png")}
            style={s.image}
          />
        </Surface>
        <Text style={s.infoText}>Skapa konto</Text>
        {firebaseError && (
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            {firebaseError}
          </Text>
        )}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                mode="outlined"
                theme={{ roundness: 8 }}
                label="Namn"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={s.inputField}
                autoCapitalize="words"
              />
            </View>
          )}
          name="displayName"
        />
        {errors.displayName && (
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            {errors.displayName.message}
          </Text>
        )}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                mode="outlined"
                theme={{ roundness: 8 }}
                label="Epost"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={s.inputField}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}
          name="email"
        />
        {errors.email && (
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            {errors.email.message}
          </Text>
        )}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                mode="outlined"
                theme={{ roundness: 8 }}
                label="Lösenord"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={s.inputField}
                secureTextEntry={passwordVisibility}
                autoCapitalize="none"
              />
              <Pressable onPress={handlePasswordVisibility} style={s.eyeIcon}>
                <MaterialCommunityIcons
                  name={rightIcon}
                  size={20}
                  color={theme.colors.onBackground}
                />
              </Pressable>
            </View>
          )}
          name="password"
        />
        {errors.password && (
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            {errors.password.message}
          </Text>
        )}

        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                mode="outlined"
                theme={{ roundness: 8 }}
                label="Upprepa lösenord"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={s.inputField}
                secureTextEntry={confirmPasswordVisibility}
                autoCapitalize="none"
              />
              <Pressable
                onPress={confirmHandlePasswordVisibility}
                style={s.eyeIcon}
              >
                <MaterialCommunityIcons
                  name={confirmRightIcon}
                  size={22}
                  color={theme.colors.onBackground}
                />
              </Pressable>
            </View>
          )}
          name="confirmPassword"
        />
        {errors.confirmPassword && (
          <Text style={[s.errorText, { color: theme.colors.error }]}>
            {errors.confirmPassword.message}
          </Text>
        )}
        <View style={s.actions}>
          <Link href="/(auth)/login">
            <Text style={s.login}>Redan medlem? logga in här.</Text>
          </Link>
          <CustomPaperButton
            text="Skapa konto"
            mode="contained"
            disabled={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const s = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    padding: 20,
    flex: 1,
    gap: 10,
  },
  surface: {
    alignItems: "center",
    borderRadius: 20,
    padding: 10,
    elevation: 4,
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
  errorText: {
    fontSize: 15,
    fontWeight: 600,
  },
  inputTitle: {
    fontWeight: "700",
  },
  inputContainer: {
    position: "relative",
  },
  inputField: {
    paddingRight: 40,
    height: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  login: {
    textAlign: "center",
    textDecorationLine: "underline",
    fontWeight: 700,
    fontSize: 15,
    paddingTop: 10,
  },
  actions: {
    padding: 20,
    flex: 1,
    justifyContent: "flex-end",
    gap: 25,
  },
});
