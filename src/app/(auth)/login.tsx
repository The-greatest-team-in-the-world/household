import { signInUser } from "@/api/auth";
import { CustomPaperButton } from "@/components/custom-paper-button";
import { useTogglePasswordVisibility } from "@/hooks/useTogglePasswordVisibility";
import { getLoginErrorMessage } from "@/utils/firebase-errors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Surface, Text, TextInput } from "react-native-paper";
import { z } from "zod";

//https://github.com/APSL/react-native-keyboard-aware-scroll-view

const credentials = z.object({
  email: z
    .string({ required_error: "E-post krävs" })
    .email("Ange en giltig epost"),
  password: z
    .string({ required_error: "Lösenord krävs" })
    .min(6, "Lösenordet måste vara minst 6 tecken"),
});

type FormFields = z.infer<typeof credentials>;

export default function LoginScreen() {
  const { passwordVisibility, rightIcon, handlePasswordVisibility } =
    useTogglePasswordVisibility();
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

    const result = await signInUser(data);

    if (!result.success || !result.user) {
      const errorCode = result.error?.code || "unknown";
      setFirebaseError(getLoginErrorMessage(errorCode));
      return;
    }

    console.log("Inloggad", result.user.email);
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
          <Text style={s.infoText}>Välkommen till hushållet!</Text>
          <Image
            source={require("../../assets/images/houseHoldTransparent.png")}
            style={s.image}
          />
        </Surface>
        <Text style={s.infoText}>Logga in</Text>
        {firebaseError && (
          <Text style={{ color: "red", padding: 10 }}>{firebaseError}</Text>
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
              <TextInput
                mode="outlined"
                theme={{ roundness: 8 }}
                label="Lösenord"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                secureTextEntry={passwordVisibility}
              />
              <Pressable onPress={handlePasswordVisibility} style={s.eyeIcon}>
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
        <View style={s.actions}>
          <CustomPaperButton
            text="Logga in"
            mode="contained"
            disabled={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          />
          <Link href="/(auth)/register">
            <Text style={s.createAccount}>Inte medlem? Skapa konto här.</Text>
          </Link>
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
    gap: 25,
  },
  surface: {
    alignItems: "center",
    elevation: 4,
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
  resetLinkText: {
    textAlign: "center",
    textDecorationLine: "underline",
  },
  eyeIcon: {
    position: "absolute",
    right: 20,
    top: 35,
  },
  createAccount: {
    textAlign: "center",
    textDecorationLine: "underline",
    fontWeight: 700,
    fontSize: 15,
    paddingTop: 10,
  },
  actions: {
    padding: 20,
    gap: 15,
  },
});
