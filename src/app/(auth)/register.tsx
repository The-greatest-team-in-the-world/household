import { getRegisterErrorMessage } from "@/utils/firebase-errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Image, StyleSheet, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Button, Surface, Text } from "react-native-paper";
import { z } from "zod";

const credentials = z.object({
  email: z.string().email("Ange en giltig epost"),
  password: z.string().min(6, "Ange ett lösenord med minst 6 tecken"),
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
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      console.log("Registrerad", userCredential.user);
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
          <Text>Registrera dig!</Text>
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
          Submit
        </Button>
        <Link href="/(auth)/login" push asChild>
          <Button style={styles.button}>Back to login</Button>
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
