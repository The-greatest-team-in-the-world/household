import {
  type AudioRecorder,
  type RecordingOptions,
  AudioQuality,
  IOSOutputFormat,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../../firebase-config";

// Re-export för användning i komponenter
export { RecordingPresets } from "expo-audio";

// Custom recording options för mindre filstorlek och bättre kompatibilitet
export const CUSTOM_RECORDING_OPTIONS: RecordingOptions = {
  extension: ".m4a", // Standard iOS/Android format
  sampleRate: 44100,
  numberOfChannels: 1, // Mono för röst (mindre filstorlek)
  bitRate: 64000, // Lägre bitrate = mindre filer, fortfarande bra kvalitet för röst
  android: {
    extension: ".m4a",
    outputFormat: "mpeg4",
    audioEncoder: "aac",
  },
  ios: {
    extension: ".m4a",
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: AudioQuality.MEDIUM, // Medium istället för MAX
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 64000,
  },
};

// Be om mikrofon-tillstånd
export async function requestAudioPermissions(): Promise<boolean> {
  const permission = await requestRecordingPermissionsAsync();
  return permission.granted;
}

// Starta inspelning (tillstånd bör redan vara givet i komponenten)
export async function startRecording(recorder: AudioRecorder): Promise<void> {
  // Sätt audio mode för iOS
  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });

  // Förbered inspelningen först om den inte redan pågår
  if (!recorder.isRecording) {
    await recorder.prepareToRecordAsync();
  }

  // Starta inspelningen (record() är synkron)
  recorder.record();
}

// Stoppa inspelning och returnera URI
export async function stopRecording(recorder: AudioRecorder): Promise<string> {
  await recorder.stop();
  const uri = recorder.uri;
  if (!uri) {
    throw new Error("No recording URI returned");
  }
  return uri;
}

// Pausa inspelning
export async function pauseRecording(recorder: AudioRecorder): Promise<void> {
  await recorder.pause();
}

// Fortsätt inspelning (fortsätt från paus)
export async function resumeRecording(recorder: AudioRecorder): Promise<void> {
  await recorder.record();
}

// Ladda upp ljud till Firebase Storage
export async function uploadAudioToFirebase(
  uri: string,
  householdId: string,
  choreId: string,
): Promise<string> {
  try {
    // Konvertera till blob
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio file: ${response.statusText}`);
    }
    const blob = await response.blob();

    // Hämta file extension från URI eller använd .m4a som default
    const fileExtension = uri.split(".").pop()?.toLowerCase() || "m4a";

    // Skapa unik filsökväg
    const timestamp = Date.now();
    const filename = `chore-audio/${householdId}/${choreId}/${timestamp}.${fileExtension}`;
    const storageRef = ref(storage, filename);

    // Ladda upp till Firebase Storage
    await uploadBytes(storageRef, blob);

    // Hämta download URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error: any) {
    console.error("Error uploading audio:", error);

    // Ge mer specifik information om felet
    if (error?.code === "storage/unauthorized") {
      throw new Error(
        "Du har inte behörighet att ladda upp filer. Kontrollera Firebase Storage-regler.",
      );
    } else if (error?.code === "storage/canceled") {
      throw new Error("Uppladdningen avbröts.");
    } else if (error?.code === "storage/unknown") {
      throw new Error(
        "Okänt Firebase Storage-fel. Kontrollera att Firebase Storage är aktiverat.",
      );
    }

    throw error;
  }
}

// Ta bort ljud från Firebase Storage
export async function deleteAudioFromFirebase(audioUrl: string): Promise<void> {
  try {
    const audioRef = ref(storage, audioUrl);
    await deleteObject(audioRef);
  } catch (error) {
    console.error("Error deleting audio:", error);
    throw new Error("Failed to delete audio from Firebase");
  }
}

// Komplett funktion: spela in och ladda upp
export async function recordAndUploadAudio(
  householdId: string,
  choreId: string,
  recorder: AudioRecorder,
): Promise<string> {
  // Stoppa inspelningen och få URI
  const uri = await stopRecording(recorder);

  // Ladda upp till Firebase
  const downloadURL = await uploadAudioToFirebase(uri, householdId, choreId);

  return downloadURL;
}
