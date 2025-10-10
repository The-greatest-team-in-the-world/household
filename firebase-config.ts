import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdX-AAvyPExp5LgunxH6qXgXEZchB4tRs",
  authDomain: "household-76bdf.firebaseapp.com",
  projectId: "household-76bdf",
  storageBucket: "household-76bdf.firebasestorage.app",
  messagingSenderId: "619058228671",
  appId: "1:619058228671:web:8e589651a29ed5a802050a",
  measurementId: "G-QMFYDTGQXE",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
