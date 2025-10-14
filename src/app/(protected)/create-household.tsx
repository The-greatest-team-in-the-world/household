import { userAtom } from "@/atoms/auth-atoms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { View, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextInput, Text } from "react-native-paper";
import { z } from "zod";

export default function CreateHousholdScreen() {
  const user = useAtom(userAtom);
  const [error, setError] = useState("");

  const newHouseHold = z.object({
    householdName: z.string().min(1, "Namnge hushållet"),
    avatar: z.string().nonempty(),
    nickName: z.string().min(1),
  });

  type FormFields = z.infer<typeof newHouseHold>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(newHouseHold),
    defaultValues: {},
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setError("");
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={s.scrollContent}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <View style={s.container}>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Text>Hushållets namn</Text>
              <TextInput
                placeholder="Hushållets namn"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={s.inputField}
                autoCapitalize="words"
              />
            </View>
          )}
          name="householdName"
        />
        {errors.householdName && <Text>{errors.householdName.message}</Text>}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Text>Smeknamn</Text>
              <TextInput
                placeholder="Smeknamn"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={s.inputField}
                autoCapitalize="words"
              />
            </View>
          )}
          name="nickName"
        />
        {errors.nickName && <Text>{errors.nickName.message}</Text>}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => <View></View>}
          name="avatar"
        />
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
    gap: 10,
  },
  surface: {
    alignItems: "center",
    borderRadius: 20,
    padding: 10,
  },
  inputField: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    paddingRight: 40,
  },
});
