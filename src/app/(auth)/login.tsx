import { getLoginErrorMessage } from "@/utils/firebase-errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { FirebaseError } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Image, StyleSheet, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, Surface, Text } from "react-native-paper";
import { z } from "zod";
// Dagsvyn, vem är inloggad? sätt current user på en atom.
// Lägg i ett globalt state med atom jotai.

const credentials = z.object({
  email: z.string({ required_error: "E-post krävs" }).email("Ange en giltig epost"),
  password: z.string({ required_error: "Lösenord krävs" }).min(6, "Lösenordet måste vara minst 6 tecken"),
});

type FormFields = z.infer<typeof credentials>;

export default function LoginScreen() {
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
    try {
      const loginUser = await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log("User just logged in: ", loginUser.user);
    } catch (error) {
      if (error instanceof FirebaseError) {
        setFirebaseError(getLoginErrorMessage(error.code));
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
          <Text>Välkommen till hushållet!</Text>
          <Image source={require("../../assets/images/react-logo.png")} style={styles.image} />
        </Surface>
        {firebaseError && <Text style={{ color: "red", padding: 10 }}>{firebaseError}</Text>}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Text style={styles.inputTitle}>Epost: </Text>
              <TextInput
                placeholder="Email"
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
                placeholder="Password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.inputField}
                secureTextEntry
              />
            </View>
          )}
          name="password"
        />
        {errors.password && <Text>{errors.password.message}</Text>}
        <Button style={styles.button} disabled={isSubmitting} onPress={handleSubmit(onSubmit)}>
          Login
        </Button>
        <Link href="/(auth)/register" push asChild>
          <Button style={styles.button}>register</Button>
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
  },
  surface: {
    alignItems: "center",
    padding: 30,
    margin: 15,
  },
  image: {
    height: 200,
    width: "100%",
    resizeMode: "contain",
  },
  inputTitle: {
    fontWeight: "700",
  },
  inputField: {
    borderColor: "black",
    borderWidth: 1,
    margin: 10,
  },
  button: {
    margin: 5,
    backgroundColor: "lightgrey",
    textDecorationColor: "none",
  },
});
