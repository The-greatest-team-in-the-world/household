import { getRegisterErrorMessage } from "@/utils/firebase-errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Image, StyleSheet, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, Surface, Text } from "react-native-paper";
import { z } from "zod";

const credentials = z.object({
  displayName: z
    .string({ required_error: "Namn krävs" })
    .min(1, "Skriv in ditt namn"),
  email: z
    .string({ required_error: "E-post krävs" })
    .email("Ange en giltig epost"),
  password: z
    .string({ required_error: "Lösenord krävs" })
    .min(6, "Lösenordet måste vara minst 6 tecken"),
});

type FormFields = z.infer<typeof credentials>;

export default function RegisterScreen() {
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      await updateProfile(userCredential.user, {
        displayName: data.displayName,
      });

      console.log(
        "Registrerad",
        userCredential.user.email,
        userCredential.user.displayName,
      );
    } catch (error) {
      if (error instanceof FirebaseError) {
        setFirebaseError(getRegisterErrorMessage(error.code));
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
                secureTextEntry
              />
            </View>
          )}
          name="password"
        />
        {errors.password && <Text>{errors.password.message}</Text>}

        <Button
          style={styles.button}
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
  inputField: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
  },
  button: {
    margin: 5,
    backgroundColor: "lightgrey",
    textDecorationColor: "none",
  },
});
