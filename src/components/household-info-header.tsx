import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Surface, Text, TextInput } from "react-native-paper";

interface HouseholdInfoHeaderProps {
  householdName: string;
  householdCode: string;
  isOwner?: boolean;
  onNameChange?: (newName: string) => void;
}

export function HouseholdInfoHeader({
  householdName,
  householdCode,
  isOwner = false,
  onNameChange,
}: HouseholdInfoHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(householdName);

  const trimmedLength = tempName.trim().length;
  const isValid = trimmedLength >= 2;
  const hasError = trimmedLength > 0 && trimmedLength < 2;

  const handleSave = () => {
    if (isValid && tempName !== householdName && onNameChange) {
      onNameChange(tempName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(householdName);
    setIsEditing(false);
  };

  return (
    <Surface style={styles.card} elevation={1}>
      {isEditing ? (
        <View style={styles.nameContainer}>
          <TextInput
            value={tempName}
            onChangeText={setTempName}
            mode="outlined"
            style={styles.input}
            autoFocus
            onBlur={handleSave}
            onSubmitEditing={handleSave}
            error={hasError}
          />
          <IconButton
            icon="check"
            size={20}
            onPress={handleSave}
            disabled={!isValid}
            style={styles.editButton}
          />
          <IconButton
            icon="close"
            size={20}
            onPress={handleCancel}
            style={styles.editButton}
          />
        </View>
      ) : (
        <>
          <View style={styles.nameContainer}>
            <View style={styles.iconPlaceholder} />
            <Text variant="headlineMedium" style={styles.householdName}>
              {householdName}
            </Text>
            {isOwner && onNameChange ? (
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              />
            ) : (
              <View style={styles.iconPlaceholder} />
            )}
          </View>
          <Text variant="bodyMedium" style={styles.code}>
            Hushållskod: {householdCode}
          </Text>
        </>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 12,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  householdName: {
    textAlign: "center",
    marginBottom: 4,
  },
  input: {
    flex: 1,
    marginHorizontal: 16,
    textAlign: "center",
  },
  editButton: {
    margin: 0,
    marginLeft: 4,
  },
  iconPlaceholder: {
    width: 40,
    marginLeft: 4,
  },
  code: {
    textAlign: "center",
    marginBottom: 8,
    opacity: 0.7,
  },
});
