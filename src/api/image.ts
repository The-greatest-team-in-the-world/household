import * as ImagePicker from "expo-image-picker";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../../firebase-config";

// Be om kamera-tillstånd
export async function requestCameraPermissions(): Promise<boolean> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  return permission.granted;
}

// Be om media library-tillstånd
export async function requestMediaLibraryPermissions(): Promise<boolean> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return permission.granted;
}

export async function uploadImageToFirebase(
  uri: string,
  householdId: string,
  choreId: string,
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(
    storage,
    `households/${householdId}/chores/${choreId}/images/${Date.now()}.jpg`,
  );
  await uploadBytes(storageRef, blob);

  return await getDownloadURL(storageRef);
}

export async function deleteImageFromFirebase(imageUrl: string): Promise<void> {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Failed to delete image from Firebase");
  }
}
