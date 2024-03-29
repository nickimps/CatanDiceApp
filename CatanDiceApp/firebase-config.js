// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence } from "firebase/auth/react-native";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyT3Vuiu4GK1vGrDzsdfOMxYaRj08rdSU",
  authDomain: "catandiceapp.firebaseapp.com",
  projectId: "catandiceapp",
  storageBucket: "catandiceapp.appspot.com",
  messagingSenderId: "641765092286",
  appId: "1:641765092286:web:69fe0827c7e33f7252e7ef",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Export firestore database
// It will be imported into your react app whenever it is needed
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
