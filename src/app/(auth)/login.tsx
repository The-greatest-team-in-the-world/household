import { useTogglePasswordVisibility } from "@/hooks/useTogglePasswordVisibility";
import { getLoginErrorMessage } from "@/utils/firebase-errors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { FirebaseError } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, Surface, Text, TextInput } from "react-native-paper";
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
  const auth = getAuth();
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

    try {
      const loginUser = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      console.log("User just logged in: ", loginUser.user);
    } catch (error) {
      if (error instanceof FirebaseError) {
        setFirebaseError(getLoginErrorMessage(error.code));
        console.error("Firebase error:", error.code, error.message);
      } else {
        console.error("Oväntat fel vid inloggning:", error);
        setFirebaseError("Ett oväntat fel uppstod. Försök igen.");
      }
    }
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
          <Text style={styles.infoText}>Välkommen till hushållet!</Text>
          <Image
            source={require("../../assets/images/houseHoldTransparent.png")}
            style={styles.image}
          />
        </Surface>
        <Text style={styles.infoText}>Logga in</Text>
        {firebaseError && (
          <Text style={{ color: "red", padding: 10 }}>{firebaseError}</Text>
        )}
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
                autoCapitalize="none"
                secureTextEntry={passwordVisibility}
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
        <Link href={"/"}>
          <Text style={styles.resetLinkText}>
            Glömt ditt lösenord? Klicka här.
          </Text>
        </Link>
        <Button
          mode="contained"
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        >
          Logga in
        </Button>
        <Link href="/(auth)/register" replace asChild>
          <Button mode="contained">Skapa konto</Button>
        </Link>
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
  inputField: {
    paddingRight: 40,
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
});
